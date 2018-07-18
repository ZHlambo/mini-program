// const windowHeight = wx.getSystemInfoSync().windowHeight;
Component({
  properties: {
    startTouch: {// 是否开始触碰视图
      type:Boolean,
      value:false
    },
    lingthDot: {// 刷新视图中，亮点的视图
      type: Number,
      value: 0
    },
    startX: {// 触碰事件的第一个点X
      type: Number,
      value: 0
    },
    startY: {// 触碰事件的第一个点Y
      type: Number,
      value: 0
    },
    showHeight: {// 刷新视图的可视高度
      type: Number,
      value: 0
    },
    viewHeight: {// 刷新视图的最终真实高度
      type: Number,
      value: 150
    },
    end: {//触摸事件结束标志，为视图添加css transition实现回滚效果
      type: Boolean,
      value: false
    },
    scrollY: {// 视图滚动的位置，当为0时，则可以触发下拉刷新视图
      type: Number,
      value: 0
    },
    refreshing: {// 下拉刷新状态，true为刷新中，此时showHeight == viewHeight
      type: Boolean,
      value: false
    },
    loadMore: {// 加载更多的状态，-1为加载中，1为可加载更多，0为不可加载更多（此时加载更多视图不可视，并再无此事件）
      type: Number,
      value: 0
    },
  },
  created: function () {
    this.interval = setInterval(() => {
      if (this.data.showHeight) {
        let lingthDot = this.data.lingthDot;
        lingthDot += 1;
        this.setData({
          lingthDot
        });
      }
    }, 300);
  },
  detached: function () {
    clearInterval(this.interval);
  },
  methods: {
    /**
     * 下拉刷新事件：
     *  _start     设置初始触碰的位置信息
     *  _move      获取滑动时触碰的位置信息，设置刷新视图高度
     *  _end       获取触碰结束位置信息，判断是否需要触发刷新事件（refresh）
     *  _scroll    设置scrollY，scrollY为0的时候，才能触发刷新视图
     *  _toupper   scroll事件概率出现滑动到顶部的时候最后一个scrollTop不是0，所以添加upper事件作为确保滑动到顶部设置scrollY为0
     * 
     * 上拉加载更多
     *  _tolower  视图滑动到底部触发加载更多事件（loadMore）
     * 
     * 备注：(触发事件)
     *  refresh     该事件触发后需要回调，通过回调刷新视图
     *  loadMore    该事件触发后可不回调，通过设置loadMore的值，修改视图的展示
    */
    _start: function (e) {
      let { showHeight } = this.data;
      let { touches } = e;
      this.setData({
        end: false,
        startTouch: true,
        touching: true,
        startX: touches[0].pageX,
        startY: touches[0].pageY - showHeight,
      });
    },
    _move: function (e) {
      let {
        startTouch,
        scrollY,
        startY,
        startX,
        touching,
        showHeight
      } = this.data;
      let { touches } = e;
      let nextX = touches[0].pageX;
      let nextY = touches[0].pageY;

      // 初始操作时侧滑禁止使用下拉刷新
      if (
        !touching ||
        (startTouch && 
          Math.abs(nextX - startX) >
          Math.abs(nextY - startY))
      ) {
        this.setData({ touching: false, startTouch:false });
        return;
      }

      /**
       * 上滑操作，viewHeight视图高度不断减少，最少为0
       * 下拉操作，viewHeight视图高度不断增加
      */
      let nextHeight = nextY - startY;
      nextHeight = nextHeight < 0 ? 0 : nextHeight;

      // scrollY == 0 的时候，视图在最顶端，可下拉增加高度，展示刷新视图
      if (scrollY == 0) {
        showHeight = nextHeight;
      }

      this.setData({
        showHeight,
        startTouch: false
      });
      return e;
    },
    _end: function () {
      let {
        showHeight,
        refreshing,
        viewHeight,
        loadMore,
        scrollY
      } = this.data;
      if (scrollY == 0) {
        /**
         * 刷新视图展示高度showHeight >= viewHeight时，刷新视图回滚到设定的高度viewHeight，为刷新状态，并呼起刷新事件
         * 反之，则回滚到0高度，恢复为不刷新状态
        */
        if (showHeight >= viewHeight) {
          showHeight = viewHeight;
          this.setData({
            end: true,
            showHeight
          });
          if (!refreshing) {
            this.setData({ refreshing: true });
            /**
             * 该事件需要回调，回调设置视图回到初始状态
            */
            this.triggerEvent('refresh', {
              refreshOver: () =>
                this.setData({
                  refreshing: false,
                  end: true,
                  showHeight: 0
                })});
          }
        } else {
          this.setData({
            end: true,
            showHeight: loadMore == -1 && scrollY <= 0 ? viewHeight : 0
          });
        }
      }
    },
    _scroll: function (e) {
      let { scrollTop } = e.detail;
      let { showHeight } = this.data;
      this.setData({
        scrollY: showHeight ? 0 : scrollTop
      });
    },
    _toupper: function () {
      this.setData({
        scrollY: 0
      });
    },
    _tolower: function () {
      if (this.data.loadMore === 1) {
        this.triggerEvent('loadMore', '');
      }
    }
  }
});
