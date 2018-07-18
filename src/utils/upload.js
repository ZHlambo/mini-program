var url = 'https://up-z2.qiniup.com';

export function upload(filePath, success, fail, progress) {
  let options = { filePath};
  if (null == options.filePath) {
    return;
  }

  let {
    token,
    host,
    time
  } = getApp().globalData.uploadToken || {};
  this.filePath = filePath;
  this.tokenPromise = new Promise(resolve => {
    if (!time || new Date(time) <= new Date()) {
      wx.request({
        url: 'https://test-wechatapp.intbee.com/api/product/up/image/token',
        method: "get",
        header: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MDEiLCJzdWIiOiI1YjE2M2ZiMWI4YjI0NTAwMDU5YjhiNjMiLCJpYXQiOjE1MzE3MTA4ODE3ODEsImV4cCI6MTUzMTczNjA4MTc4MX0.vPufDKkLqGtWktSPwW0nrcOs - 9TqODeaxL7_JtL465I"
        },
        success: function(result) {
          let res = result.data.result;
          token = res.token;
          host = res.host;
          getApp().globalData.uploadToken = {
            token,
            host,
            time: new Date().getTime() + 60 * 60 * 1000
          };
          resolve(options);
        }
      });
    } else {
      resolve(options);
      }
  }).then(options => {
    options.host = host;
    options.token = token;
    this.uploadTask = doUpload(options, success, fail, progress);
  });
  return this;
}

function doUpload(options, success, fail, progress) {
  var uploadTask = wx.uploadFile({
    fail,
    url,
    filePath: options.filePath,
    name: 'file',
    formData: {
      token: options.token
    },
    success: function(res) {
      var dataString = res.data;
      if (res.data.hasOwnProperty('type') && res.data.type === 'Buffer') {
        dataString = String.fromCharCode.apply(null, res.data.data);
      }
      try {
        var dataObject = JSON.parse(dataString);
        var imageUrl = options.host;
        imageUrl.replace('http://', 'https://');
        imageUrl = imageUrl + '/' + dataObject.key;
        success && success(imageUrl);
      } catch (e) {
        fail && fail(e);
      }
    }
  });

  uploadTask.onProgressUpdate(res => {
    progress && progress(res);
  });

  return uploadTask;
}