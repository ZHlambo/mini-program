// components/UploadImages.js
Component({
  properties: {
    srcs: {
      type: Array,
      value: []
    },
    count: {
      type: Number,
      value: 9
    }
  },
  data: {

  },
  methods: {
    _chooseImages: function() {
      let {
        srcs,
        count
      } = this.data;
      wx.chooseImage({
        count: count - srcs.length,
        success: (e) => {
          let tempFilePaths = e.tempFilePaths;
          if (tempFilePaths.length > 0) {
            srcs = srcs.concat(tempFilePaths);
            this.setData({ srcs})
            // 通知外部，添加图片正在上传中
            this.triggerEvent('upload', {
              srcs
            }, {});
          }
        },
      })
    },
    _upload:function(e){
      let {index} = e.currentTarget.dataset;
      let {srcs} = this.data;
      let {src} = e.detail;
      srcs[index] = src;
      this.setData({ srcs });
      this.triggerEvent('upload', {
        srcs,
        src
      }, {});
    },
    _deleteImage: function (e) {
      let { index } = e.currentTarget.dataset;
      let { srcs } = this.data;
      let { src } = e.detail;
      srcs.splice(index,1);
      this.setData({ srcs });
      this.triggerEvent('upload', {
        srcs,
        src
      }, {});

    },
    _fail: function (e) {
      let { index } = e.currentTarget.dataset;
      let { src } = e.detail;
      let { srcs } = this.data;
      srcs.splice(index, 1);
      this.triggerEvent('upload', { srcs }, {});
      this.setData({ srcs });
    },
  }
})