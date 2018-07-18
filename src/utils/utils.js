
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