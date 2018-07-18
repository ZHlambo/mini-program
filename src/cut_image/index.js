// pages/cut_image/index.js
import { pxTorpxScale, windowWidthPX, windowWidthRPX, windowHeightPX, windowHeightRPX} from "../utils/utils.js"
const bottomRPX = 90;
const bottomPX = bottomRPX / pxTorpxScale;
const windowSide = 3 / 4 * windowHeightPX;

const getSide = (x, y) => {
  return Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5);
}
const getDistance = (touches) => {
  if (touches.length >= 2) {
    let x = touches[0].pageX - touches[1].pageX;
    let y = touches[0].pageY - touches[1].pageY;
    return getSide(x, y);
  }
  return 0;
}
const getCenterPoint = (touches) => {
  if (touches.length >= 2) {
    return {
      x: (touches[0].pageX + touches[1].pageX) / 2,
      y: (touches[0].pageY + touches[1].pageY) / 2
    }
  };
  return 0;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvasId: "image",
    scale: 1,
    offsetx: 0,
    offsety: 0,
    finishx: 0,
    finishy: 0,
    finishScale: 1,
    pxTorpxScale,
    windowHeightRPX,
    windowWidthRPX,
    rectxPX: 300,
    rectyPX: 300,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      src,
    } = options;
    let {
      rectxPX,
      rectyPX,
      offsetx,
      offsety,
      finishScale
    } = this.data;
    let rectStartx = (windowWidthPX - rectxPX) / 2,
      rectStarty = (windowHeightPX - bottomPX - rectxPX) / 2,
      rectEndx = rectStartx + rectxPX,
      rectEndy = rectStarty + rectyPX,
      rect = {
        startx: rectStartx,
        starty: rectStarty,
        endx: rectEndx,
        endy: rectEndy,
        width: rectxPX,
        height: rectyPX
      };
    this.setData({
      event,
      src
    });
    wx.getImageInfo({
      src,
      complete: (e) => {
        let {
          width,
          height,
          path
        } = e;
        if (rect.width / width < rect.height / height) {
          finishScale = rect.height / height;
          offsetx = (windowWidthPX - width * finishScale) / 2;
          offsety = rect.starty;
        } else {
          finishScale = rect.width / width;
          offsetx = rect.startx;
          offsety = (windowHeightPX - height * finishScale - bottomPX) / 2;
        }
        this.data = Object.assign(this.data, {
          ctx: wx.createCanvasContext(this.data.canvasId, this),
          imgWidth: width,
          imgHeight: height,
          imagePath: path,
          finishScale,
          rect,
          finishx: offsetx,
          finishy: offsety,
        });
        this.drawImage(offsetx, offsety, finishScale);
      }
    })
  },

  drawImage: function (x, y, scale) {
    let {
      imagePath,
      imgWidth,
      imgHeight,
      finishScale,
      ctx,
      rect,
    } = this.data;

    let _scale = scale || finishScale;

    let imgEndx = x + _scale * imgWidth;
    let imgEndy = y + _scale * imgHeight;

    // if (scale) {
    //   if (x > rect.startx) {
    //     x = rect.startx;
    //   } else if (imgEndx < rect.endx ) {
    //     imgEndx = rect.endx
    //     x = x + rect.endx - imgEndx;
    //     if (x > rect.startx) {
    //       x = rect.startx;
    //     }
    //   }
    //   if (y > rect.starty) {
    //     y = rect.starty;
    //   } else if (imgEndy < rect.endy) {
    //     imgEndy = rect.endy
    //     y = y + rect.endy - imgEndy;
    //     if (y > rect.starty) {
    //       y = rect.starty;
    //     }
    //   }
    // } else {
    //   if (x > rect.startx) {
    //     x = rect.startx;
    //   } else if (imgEndx < rect.endx) {
    //     x = rect.endx - _scale * imgWidth
    //   }
    //   if (y > rect.starty) {
    //     y = rect.starty;
    //   } else if (imgEndy < rect.endy) {
    //     y = rect.endy - _scale * imgHeight
    //   }
    // }

    ctx.clearRect(0, 0, windowHeightPX, windowWidthPX);
    ctx.drawImage(imagePath, x, y, _scale * imgWidth, _scale * imgHeight);

    ctx.lineWidth = windowSide;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.rect(rect.startx - windowSide / 2, rect.starty - windowSide / 2, rect.width + windowSide, rect.height + windowSide);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.rect(rect.startx, rect.starty, rect.width, rect.height);
    ctx.setStrokeStyle('white')
    ctx.stroke();

    ctx.draw();
    this.setData({
      offsetx: x,
      offsety: y,
      scale: _scale
    });
  },
  start: function (e) {
    let {
      offsetx,
      offsety,
      scale,
      imgWidth,
      imgHeight,
    } = this.data;
    let touches = e.touches;
    this.setData({
      startx: touches[0].pageX,
      starty: touches[0].pageY,
      startDistance: getDistance(touches),
      startCenterPoint: getCenterPoint(touches),
    });
  },
  end: function (e) {
    let {
      offsetx,
      offsety,
      scale,
    } = this.data;

    this.setData({
      finishx: offsetx,
      finishy: offsety,
      finishScale: scale,
    });
  },
  move: function (e) {
    let touches = e.touches,
      offsetx = touches[0].pageX,
      offsety = touches[0].pageY;
    let {
      ctx,
      startx,
      starty,
      startDistance,
      startCenterPoint,
      scale,
      finishx,
      finishy,
      finishScale,
    } = this.data;

    // 开始只有一个触碰点，move出现第二个；
    if (touches.length >= 2) {
      let distance = getDistance(touches);
      if (startDistance == 0) {
        this.setData({
          startDistance: distance,
          startCenterPoint: getCenterPoint(touches),
        });
      } else {
        // startDistance双触开始时距离distance双触后距离
        scale = distance / startDistance;
        let sideLength = getSide(startCenterPoint.x - finishx, startCenterPoint.y - finishy);
        sideLength = sideLength * scale;
        let distanceScale = (startCenterPoint.y - finishy) / (startCenterPoint.x - finishx);
        let offsetx = Math.pow(sideLength * sideLength / (1 + distanceScale * distanceScale), 0.5);
        let offsety = offsetx * distanceScale;
        scale = scale * finishScale;
        this.drawImage(startCenterPoint.x - offsetx, startCenterPoint.y - offsety, scale);
      }
    } else if (startDistance == 0) {
      offsetx = offsetx - startx + finishx;
      offsety = offsety - starty + finishy;
      this.drawImage(offsetx, offsety);
    }
  },
  save: function () {
    let {
      ctx,
      canvasId,
      rectxPX,
      rectyPX,
      rect,
    } = this.data;
    wx.canvasToTempFilePath({
      canvasId,
      x: rect.startx,
      y: rect.starty,
      width: rectxPX,
      height: rectyPX,
      complete: e => {
        wx.navigateBack({
          src: e.tempFilePath
        });
      }
    }, this);
  },
  onUnload: function () {
    getApp()
      .eventHub.trigger(this.data.event, "");
  }

})