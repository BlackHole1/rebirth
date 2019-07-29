class RecordingQueue {
  private queue: Function[];
  constructor () {
    this.queue = [];
  }

  enqueue (fun: Function) {
    this.queue.push(fun);

    // 第一次加入队列时，自动运行
    if (this.length() === 1) {
      this.front()();
    }
  }

  dequeue () {
    this.queue.shift();
  }

  front() {
    return this.queue[0];
  }

  complete () {
    this.dequeue();
    this.isEmpty() || this.front()();
  }

  remove () {
    this.queue = [];
  }

  length () {
    return this.queue.length;
  }

  isEmpty() {
    return this.length() === 0;
  }
}

export default new RecordingQueue();
