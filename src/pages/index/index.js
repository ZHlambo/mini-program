const app = getApp();
const list = (offset, length) => {
  let array = [];
  for (var i = 0; i < length; i++) {
    array[i] = offset + i + "代码片段是一种迷你、可分享的小程序或小游戏项目，可用于分享小程序和小游戏的开发经验、展示组件和 API 的使用、复现开发问题和 Bug 等。可点击以下链接查看代码片段的详细文档：";
  }
  return array;
}
const request = (offset = 0, limit = 4) => {
  return new Promise(resolve => {
    if (offset >= 20) {
      resolve([])
    }
    setTimeout(() => {
      resolve(list(offset, limit));
    }, 2000);
  })
}

Page({
  data: {
    list:[],
    loadMore:1
  },
  onLoad: function() {
    this.getList();
  },
  getList: function (offset = 0, limit= 4){
    this.setData({ loadMore: -1});
    return request(offset,limit).then(res=>{
      let loadMore = res.length < limit ? 0 : 1;
      if(offset !== 0) {
        res = this.data.list.concat(res);
      }
      this.setData({ list: res ,loadMore});
    });
  },
  refresh:function(e){
    console.log(e)
    this.getList().then(res => {
      e.detail.refreshOver();
    })
  },
  loadMore:function(){
    this.getList(this.data.list.length);
  },
  upload:function(e){
    let {src} = e.detail;
    this.setData({src})
    console.log(src)
  },
})