// components/Upload.js
import {
  upload
} from "../utils/upload.js"

/**
 * 判断是本地图片还是远程图片（上传图片用）
 *
 * @return {boolean}
 */
const isLocal = function(src) {
  if (
    src &&
    src.indexOf('http://miniprogram') !== 0 &&
    src.indexOf('https://miniprogram') !== 0 &&
    src.indexOf('http://static.d.intbee.com') !== 0 &&
    src.indexOf('https://static.d.intbee.com') !== 0
  ) {
    return true;
  }
  return false;
};


const windowWidth = 750;
const windowWidthPX = wx.getSystemInfoSync().windowWidth;
const pxTorpxScale = windowWidth / windowWidthPX;
const windowHeightPX = wx.getSystemInfoSync().windowHeight;
const imageTasks = getApp().imageTasks;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    compress: {
      type: Boolean,
      value: true,
    },
    src: {
      type: String,
      value: "",
    },
    minWidth: {
      type: Number,
      value: 0
    }
  },

  data: {
    windowWidthPX,
    windowHeightPX,
    imgHeight: 0,
    progress: 0
  },
  ready: function() {
    let {
      src
    } = this.data;
    if (isLocal(src)) {
      this._uploadRequest(src);
    }
    this.setData({
      canvasId: this.__wxExparserNodeId__
    });
  },
  detached: function() {
    let {
      uploadTask
    } = this.data.uploadFile || {};
    if (uploadTask) {
      uploadTask.abort();
    }
  },
  methods: {
    _chooseImage: function() {
      wx.chooseImage({
        count: 1,
        success: e => {
          let tempFilePaths = e.tempFilePaths;
          if (!tempFilePaths || !tempFilePaths[0]) {
            return;
          }

          // 先设置_src为上传的图片，若外部更改了src为相同，则不会再上传
          this.setData({
            _src: tempFilePaths[0]
          });
          // 通知外部，图片正在上传中
          this.triggerEvent('upload', {
            src: tempFilePaths[0]
          }, {});
          this._uploadRequest(tempFilePaths[0]);
        }
      })
    },

    // 图片上传
    _uploadRequest: function(src) {
      // 由于draw只能同时画一个，以及上传文件也只能同时上传一个，故做全局线程池保证只操作一个图片上传动作
      let task = () => {
        return new Promise(resolve => {
          this._uploadMiddle(src).then(src => {
            let uploadFile = new upload(src,
              src => {
                resolve();
                this.setData({
                  _src: src,
                  progress: 0
                });
                this.triggerEvent('upload', {
                  src
                }, {});
              },
              err => {
                resolve();
                if (err.errMsg.indexOf("abort") === -1) {
                  this.fail(err);
                }
              },
              res => {
                this.setData({
                  progress: res.progress >= 100 ? 0 : res.progress
                })
              });
            this.setData({
              uploadFile
            });
          });
        })
      }
      imageTasks.addTask(task);
    },

    // 中间件，图片上传前的校验等操作
    _uploadMiddle: function(src) {
      let {
        compress
      } = this.data;
      return new Promise((resolve, reject) => {
        this._authImage(src).then(res => {
          if (!compress) {
            resolve(res.path);
          } else {
            this._compressImage(res).then(src => {
              resolve(src)
            });
          }
        })
      })
    },

    // 校验图片
    _authImage: function(src) {
      let {
        minWidth
      } = this.data;
      return new Promise((resolve, reject) => {
        wx.getImageInfo({
          src,
          fail: err => this.fail(err),
          success: res => {
            if (minWidth && res.width <= minWidth) {
              this.fail({
                errMsg: `图片宽度至少${minWidth}px`
              });
            } else {
              resolve(res);
            }
          }
        })
      });
    },

    //压缩图片
    _compressImage: function(imageData) {
      let {
        minWidth,
        canvasId
      } = this.data;
      let width = windowWidthPX;
      let height = imageData.height / imageData.width * windowWidthPX;
      let ctx = wx.createCanvasContext(canvasId, this);
      ctx.drawImage(imageData.path, 0, 0, width, height);
      return new Promise((resolve, reject) => {
        ctx.draw(false, () => {
          getApp().globalData.drawLoading = true;
          wx.canvasToTempFilePath({
              x: 0,
              y: 0,
              width,
              height,
              canvasId,
              fail: err => this.fail(err),
              success: res => {
                resolve(res.tempFilePath)
              }
            },
            this
          );
        });
      })
    },

    fail: function(res = {}) {
      wx.showToast({
        title: res.errMsg,
        icon: "none",
      });
      this.triggerEvent('fail', {
        src: "",
        errMsg: res.errMsg
      }, {});
    }
  }
})