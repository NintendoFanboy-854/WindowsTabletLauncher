/**
 * 轻量 CDP 客户端（Apple Music 插件自用）。
 *
 * 只实现本插件需要的两条通道：`Runtime.evaluate`（读页面状态）与
 * `Input.dispatchMouseEvent`（真实指针点击）。不订阅事件、不开 domain、不做协议编解码之外的
 * 任何事——宿主只透传 `/json/list`，WebSocket 由插件自己连（浏览器侧靠宿主启动参数里的
 * `--remote-allow-origins` 放行插件 origin）。
 *
 * 一个 page target 同时只允许一个 WebSocket 客户端（真机探针结论），所以本模块不重连、不排队：
 * 上层 `library.js` 负责「先关旧连接再连新的」。
 */

/** 建连超时：Edge 的 DevTools 端口通常几百毫秒内就绪，留足冷启动余量。 */
const CONNECT_TIMEOUT_MS = 6000;
/** 普通命令超时（点击等短命令）。 */
const SEND_TIMEOUT_MS = 5000;
/** evaluate 超时：页面忙时（起播/切页）会比点击慢。 */
const EVALUATE_TIMEOUT_MS = 8000;

/** `setTimeout` 的 Promise 包装（插件里不引入定时器库）。 */
export function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * 一个 CDP 页面连接。
 *
 * 用法：
 *   const client = new CdpClient(webSocketDebuggerUrl);
 *   await client.open();
 *   await client.evaluate('1 + 1');                 // → 2
 *   await client.clickPoint(100, 200);              // 真实指针点击
 *   client.close();
 */
export class CdpClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.closeHandlers = [];
  }

  /** 是否处于可发命令的状态 */
  isOpen() {
    return Boolean(this.ws) && this.ws.readyState === WebSocket.OPEN;
  }

  /** 关闭时回调（只用于上层把 `session` 置空，不在这里自动重连） */
  onClose(handler) {
    if (typeof handler !== 'function') return () => {};
    this.closeHandlers.push(handler);
    return () => {
      this.closeHandlers = this.closeHandlers.filter((entry) => entry !== handler);
    };
  }

  /**
   * 建连。只解析一次 open/error/close：失败原因统一成中文一句事实，由上层决定怎么显示。
   */
  open() {
    if (this.isOpen()) return Promise.resolve(this);
    return new Promise((resolve, reject) => {
      let settled = false;
      let timer = 0;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        if (error) reject(error);
        else resolve(this);
      };

      let socket;
      try {
        socket = new WebSocket(this.url);
      } catch {
        reject(new Error('连接播放器失败'));
        return;
      }
      this.ws = socket;

      timer = window.setTimeout(() => {
        try {
          socket.close();
        } catch {
          /* 已关闭 */
        }
        finish(new Error('连接播放器超时'));
      }, CONNECT_TIMEOUT_MS);

      socket.onopen = () => finish(null);
      socket.onerror = () => finish(new Error('连接播放器失败'));
      socket.onclose = () => {
        this.#rejectAll('播放器连接已断开');
        this.#emitClose();
        finish(new Error('播放器连接已断开'));
      };
      socket.onmessage = (event) => this.#handleMessage(event.data);
    });
  }

  /**
   * 发一条 CDP 命令并等回包。
   *
   * @param {string} method 如 `Runtime.evaluate`
   * @param {object} [params]
   * @param {number} [timeoutMs]
   * @returns {Promise<any>} CDP `result`
   */
  send(method, params = {}, timeoutMs = SEND_TIMEOUT_MS) {
    if (!this.isOpen()) return Promise.reject(new Error('播放器连接已断开'));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.pending.delete(id);
        reject(new Error('播放器响应超时'));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      try {
        this.ws.send(JSON.stringify({ id, method, params }));
      } catch (error) {
        window.clearTimeout(timer);
        this.pending.delete(id);
        reject(error instanceof Error ? error : new Error('播放器连接已断开'));
      }
    });
  }

  /**
   * 在页面里求值并取回 JSON 值。
   *
   * `userGesture: true` 让页面把这次求值当成用户手势，导航类 `.click()` 因此可用；
   * 播放/暂停仍然走真实指针（Input），不依赖这个标志。
   */
  async evaluate(expression, timeoutMs = EVALUATE_TIMEOUT_MS) {
    const result = await this.send(
      'Runtime.evaluate',
      {
        expression,
        returnByValue: true,
        awaitPromise: true,
        userGesture: true,
      },
      timeoutMs,
    );
    if (result && result.exceptionDetails) {
      throw new Error('播放器页面出错');
    }
    return result && result.result ? result.result.value : undefined;
  }

  /**
   * 让页面按「前台激活页」处理（不显示窗口）。
   *
   * 真机结论：受管 Edge 窗口被 `SW_HIDE` 之后，页面的 `document.visibilityState` 是
   * `hidden`，Apple Music 的 DRM/MSE 初始缓冲不会推进（`audio.paused=false` 但
   * `readyState=0 / currentTime=0` 一直卡住）；打开焦点模拟后页面变成 visible，
   * 同一套 CDP 点击立刻正常起播，且窗口仍然隐藏。只在连接后调用一次，失败不影响主流程。
   */
  async setActivePage(enabled = true) {
    await this.send('Emulation.setFocusEmulationEnabled', { enabled }).catch(() => null);
  }

  /** 真实指针点击（隐藏窗口下同样有效；真机探针已验证）。 */
  async clickPoint(x, y) {
    const point = { x: Math.round(x), y: Math.round(y) };
    await this.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      ...point,
      button: 'left',
      buttons: 1,
      clickCount: 1,
    });
    await this.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      ...point,
      button: 'left',
      buttons: 0,
      clickCount: 1,
    });
  }

  /** 主动关闭：先拒绝在途命令，再关 socket，最后通知上层。 */
  close() {
    const socket = this.ws;
    this.ws = null;
    this.#rejectAll('播放器连接已断开');
    if (socket) {
      try {
        socket.close();
      } catch {
        /* 已经关了 */
      }
    }
    this.#emitClose();
  }

  #handleMessage(raw) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }
    if (!data || data.id === undefined || data.id === null) return;
    const entry = this.pending.get(data.id);
    if (!entry) return;
    this.pending.delete(data.id);
    window.clearTimeout(entry.timer);
    if (data.error) {
      entry.reject(new Error('播放器页面出错'));
      return;
    }
    entry.resolve(data.result);
  }

  #rejectAll(message) {
    for (const [id, entry] of this.pending) {
      this.pending.delete(id);
      window.clearTimeout(entry.timer);
      entry.reject(new Error(message));
    }
  }

  #emitClose() {
    const handlers = this.closeHandlers.slice();
    for (const handler of handlers) {
      try {
        handler();
      } catch {
        /* 监听器自己的错误不影响连接清理 */
      }
    }
  }
}
