import {
  isLocal,
  windowWidthRPX,
  pxTorpxScale
} from "../utils/utils.js"

Component({
  properties: {
    srcs: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal) {
        // 每次setData传进来的srcs都会调用该函数
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.setData({
            images: newVal.map(image => ({
              image
            }))
          });
        }
        // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
        // 通常 newVal 就是新设置的数据， oldVal 是旧数据
      }
    },
    current: {
      type: Number,
      value: 0
    },
    showHeight: {
      type: Number,
      value: 0
    },
    translate: {
      type: Number,
      value: 0
    }
  },
  data: {
    windowWidthRPX
  },
  methods: {
    loadImage: function (e) {
      let {
        width,
        height
      } = e.detail;
      let {
        index
      } = e.currentTarget.dataset;
      this.data.images[index].height = height / width * windowWidthRPX;
      this.setData({
        images: this.data.images
      });
    },
    _start: function (e) {
      let {
        current,
        images
      } = this.data;
      let {
        touches
      } = e;
      this.setData({
        moveX: 0,
        touchStart: true,
        nowHeight: images[current].height,
        touching: true,
        startX: touches[0].pageX,
        startY: touches[0].pageY
      });
    },
    _move: function (e) {
      let {
        touchStart,
        startX,
        startY,
        nowHeight,
        current,
        images
      } = this.data;
      let {
        touches
      } = e;
      if (
        touchStart &&
        Math.abs(touches[0].pageX - startX) <
        Math.abs(touches[0].pageY - startY)
      ) {
        this.setData({
          touching: false
        });
        return;
      }
      let nextHeight = nowHeight;
      // pageX单位是px，这里转rpx需要乘以pxTorpxScale
      let moveX = (touches[0].pageX - startX) * pxTorpxScale;
      let translate = moveX - current * windowWidthRPX;
      if (moveX > 0) {
        if (current - 1 >= 0) {
          nextHeight = images[current - 1].height;
        }
      } else {
        if (current + 1 <= images.length - 1) {
          nextHeight = images[current + 1].height;
        }
      }
      let scale = Math.abs(moveX) / windowWidthRPX;
      let showHeight = scale * (nextHeight - nowHeight) + nowHeight;
      this.setData({
        touchStart: false,
        touching: true,
        showHeight,
        moveX,
        translate
      });
    },
    _end: function () {
      let {
        moveX,
        current,
        images
      } = this.data;
      if (moveX > 0) {
        if (moveX > windowWidthRPX * 0.3) {
          current = current - 1 >= 0 ? current - 1 : current;
        }
      } else {
        if (moveX < -windowWidthRPX * 0.3) {
          current =
            current + 1 <= images.length - 1 ?
              current + 1 :
              current;
        }
      }
      this.setData({
        touching: false,
        showHeight: images[current].height,
        translate: -current * windowWidthRPX,
        current
      });
    }
  }
});