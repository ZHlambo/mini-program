export const windowWidthPX = wx.getSystemInfoSync().windowWidth;
export const windowHeightPX = wx.getSystemInfoSync().windowHeight;
export const windowWidthRPX = 750;
export const pxTorpxScale = windowWidthRPX / windowWidthPX;
export const windowHeightRPX = windowHeightPX * pxTorpxScale;

/**
 * 判断是本地图片还是远程图片（上传图片用）
 *
 * @return {boolean}
 */
export const isLocal = function (src) {
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

/**
 * 线程队列，先进线执行
 */
export const Task = function () {
  let tasks = [];
  let currentTask = "";

  /**
   * 添加线程
   * @param {function} task 线程函数，该函数内一般为异步线程Promise对象
   *        示例： let task = () => new Promise();
   */
  let addTask = (task) => {
    tasks.push(task);
    if (!currentTask) {
      run(tasks[0]);
    }
  }

  /**
   * 移除线程
   * @param {function} task 线程函数，该函数内一般为异步线程Promise对象(即addTask时的参数)
   */
  let removeTask = (task) => {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i] == task) {
        tasks.splice(i, 1);
        return;
      }
    }
  }

  /**
   * 移除线程
   * @param {function} task 线程函数，该函数内一般为异步线程Promise对象(即addTask时的参数)
   *        开始线程task  执行task()获得promise，异步完成线程后then移除该线程再调用下个task
   */
  let run = (task) => {
    currentTask = task;
    task().then(() => {
      removeTask(task);
      if (tasks[0]) {
        run(tasks[0]);
      } else {
        currentTask = ""
      }
    });
  }

  return { tasks, addTask, removeTask };
}