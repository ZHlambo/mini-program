// issues/index.js
const app = getApp();
Page({
  data: {
    nextGlobalData: {
      init: "未初始化"
    }
  },
  onLoad: function(options) {
    
  },
  onReady: function() {
    this.setData({
      appData: app.globalData,
      getAppData: getApp().globalData,
    });
  },
  changeApp: function () {
    getApp().globalData = { init: "页面onLoad修改app中的数据并赋值给nextGlobalData" };

    this.setData({
      appData: app.globalData,
      getAppData: getApp().globalData,
    });
    console.log(getApp().globalData)
  }
})