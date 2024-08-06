declare module '@guess/phoenix-js' {
  export class Socket {
    stateChangeCallbacks: {
      open: Array<[number, Function]>;
      close: Array<[number, Function]>;
      error: Array<[number, Function]>;
      message: Array<[number, Function]>;
    };
    channels: Channel[];
    sendBuffer: Function[];
    ref: number;
    timeout: number;
    transport: any;
    establishedConnections: number;
    defaultEncoder: (payload: any, callback: (result: any) => void) => void;
    defaultDecoder: (payload: any, callback: (result: any) => void) => void;
    closeWasClean: boolean;
    binaryType: string;
    connectClock: number;
    encode: (msg: any, callback: (payload: any) => void) => void;
    decode: (rawPayload: any, callback: (msg: any) => void) => void;
    reconnectTimer: Timer;
    logger: ((kind: string, msg: string, data: any) => void) | null;
    longpollerTimeout: number;
    params: () => object;
    endPoint: string;
    vsn: string;
    heartbeatTimeoutTimer: number | null;
    heartbeatTimer: number | null;
    pendingHeartbeatRef: string | null;
    reconnectAfterMs: (tries: number) => number;
    rejoinAfterMs: (tries: number) => number;

    constructor(endPoint: string, opts?: SocketOptions);

    protocol(): string;
    endPointURL(): string;
    disconnect(callback?: () => void, code?: number, reason?: string): void;
    connect(params?: any): void;
    log(kind: string, msg: string, data: any): void;
    hasLogger(): boolean;
    onOpen(callback: Function): number;
    onClose(callback: Function): number;
    onError(callback: Function): number;
    onMessage(callback: Function): number;
    ping(callback: Function): boolean;
    clearHeartbeats(): void;
    onConnOpen(): void;
    heartbeatTimeout(): void;
    resetHeartbeat(): void;
    teardown(callback?: Function, code?: number, reason?: string): void;
    waitForBufferDone(callback: Function, tries?: number): void;
    waitForSocketClosed(callback: Function, tries?: number): void;
    onConnClose(event: any): void;
    onConnError(error: any): void;
    triggerChanError(): void;
    connectionState(): "connecting" | "open" | "closing" | "closed";
    isConnected(): boolean;
    remove(channel: Channel): void;
    off(refs: number[]): void;
    channel(topic: string, chanParams?: object): Channel;
    push(data: any): void;
    makeRef(): string;
    sendHeartbeat(): void;
    flushSendBuffer(): void;
    onConnMessage(rawMessage: { data: any }): void;
  }

  export interface SocketOptions {
    timeout?: number;
    heartbeatIntervalMs?: number;
    reconnectAfterMs?: (tries: number) => number;
    rejoinAfterMs?: (tries: number) => number;
    logger?: (kind: string, msg: string, data: any) => void;
    longpollerTimeout?: number;
    params?: object | (() => object);
    transport?: any;
    longPollFallbackMs?: number;
    encode?: (payload: any, callback: (result: any) => void) => void;
    decode?: (payload: any, callback: (result: any) => void) => void;
    vsn?: string;
    binaryType?: string;
    sessionStorage?: Storage;
  }

  export class Channel {
    state: CHANNEL_STATES;
    topic: string;
    params: () => object;
    socket: Socket;
    bindings: Array<{ event: string, ref: number, callback: Function }>;
    bindingRef: number;
    timeout: number;
    joinedOnce: boolean;
    joinPush: Push;
    pushBuffer: Push[];
    stateChangeRefs: number[];
    rejoinTimer: Timer;

    constructor(topic: string, params: object | (() => object), socket: Socket);

    /**
     * Join the channel
     * @param {number} timeout
     * @returns {Push}
     */
    join(timeout?: number): Push;

    /**
     * Hook into channel close
     * @param {Function} callback
     */
    onClose(callback: Function): void;

    /**
     * Hook into channel errors
     * @param {Function} callback
     */
    onError(callback: (reason?: any) => void): number;

    /**
     * Subscribes on channel events
     * @param {string} event
     * @param {Function} callback
     * @returns {number} ref
     */
    on(event: string, callback: Function): number;

    /**
     * Unsubscribes off of channel events
     * @param {string} event
     * @param {number} ref
     */
    off(event: string, ref?: number): void;

    /**
     * @private
     */
    canPush(): boolean;

    /**
     * Sends a message `event` to phoenix with the payload `payload`
     * @param {string} event
     * @param {object} payload
     * @param {number} [timeout]
     * @returns {Push}
     */
    push(event: string, payload: object, timeout?: number): Push;

    /** Leaves the channel
     * @param {number} timeout
     * @returns {Push}
     */
    leave(timeout?: number): Push;

    /**
     * Overridable message hook
     * @param {string} event
     * @param {object} payload
     * @param {number} ref
     * @returns {object}
     */
    onMessage(event: string, payload: object, ref: number): object;

    /**
     * @private
     */
    isMember(topic: string, event: string, payload: object, joinRef?: string): boolean;

    /**
     * @private
     */
    joinRef(): string | null;

    /**
     * @private
     */
    rejoin(timeout?: number): void;

    /**
     * @private
     */
    trigger(event: string, payload: object, ref?: string, joinRef?: string): void;

    /**
     * @private
     */
    replyEventName(ref: string): string;

    /**
     * @private
     */
    isClosed(): boolean;

    /**
     * @private
     */
    isErrored(): boolean;

    /**
     * @private
     */
    isJoined(): boolean;

    /**
     * @private
     */
    isJoining(): boolean;

    /**
     * @private
     */
    isLeaving(): boolean;
  }

  export interface CHANNEL_EVENTS {
    close: "phx_close";
    error: "phx_error";
    join: "phx_join";
    reply: "phx_reply";
    leave: "phx_leave";
  }

  export interface CHANNEL_STATES {
    closed: "closed";
    errored: "errored";
    joined: "joined";
    joining: "joining";
    leaving: "leaving";
  }

  export class Push {
    channel: Channel;
    event: string;
    payload: (() => object) | object;
    receivedResp: { status: string; response: any } | null;
    timeout: number;
    timeoutTimer: number | null;
    recHooks: Array<{ status: string; callback: Function }>;
    sent: boolean;
    ref: string | null;
    refEvent: string | null;

    /**
     * Initializes the Push
     * @param channel - The Channel
     * @param event - The event, for example `"phx_join"`
     * @param payload - The payload, for example `{user_id: 123}`
     * @param timeout - The push timeout in milliseconds
     */
    constructor(channel: Channel, event: string, payload: (() => object) | object, timeout: number);

    /**
     * Resends the push with an updated timeout
     * @param timeout - The new timeout in milliseconds
     */
    resend(timeout: number): void;

    /**
     * Sends the push
     */
    send(): void;

    /**
     * Receives a response for the push
     * @param status - The status to receive
     * @param callback - The callback to be called when the response is received
     */
    receive(status: string, callback: (response: any) => void): Push;

    reset(): void;
    matchReceive(payload: { status: string; response: any; _ref: string }): void;
    cancelRefEvent(): void;
    cancelTimeout(): void;
    startTimeout(): void;
    hasReceived(status: string): boolean;
    trigger(status: string, response: any): void;
  }

  export class Presence {
    /**
     * Initializes the Presence
     * @param channel - The Channel
     * @param opts - The options, for example `{events: {state: "state", diff: "diff"}}`
     */
    constructor(channel: Channel, opts?: PresenceOpts);

    // Properties
    state: { [key: string]: any };
    pendingDiffs: any[];
    channel: Channel;
    joinRef: string | null;
    caller: {
      onJoin: (key: string, currentPresence: any, newPresence: any) => void;
      onLeave: (key: string, currentPresence: any, leftPresence: any) => void;
      onSync: () => void;
    };

    // Methods
    onJoin(callback: (key: string, currentPresence: any, newPresence: any) => void): void;
    onLeave(callback: (key: string, currentPresence: any, leftPresence: any) => void): void;
    onSync(callback: () => void): void;
    list<T = any>(by?: (key: string, presence: any) => T): T[];
    inPendingSyncState(): boolean;

    // Static methods
    static syncState(currentState: any, newState: any, onJoin: Function, onLeave: Function): any;
    static syncDiff(state: any, diff: { joins: any; leaves: any }, onJoin: Function, onLeave: Function): any;
    static list<T = any>(presences: any, chooser?: (key: string, presence: any) => T): T[];
    static map(obj: any, func: Function): any[];
    static clone(obj: any): any;
  }

  interface PresenceOpts {
    events?: {
      state: string;
      diff: string;
    };
  }


  export class Timer {
    callback: Function;
    timerCalc: (tries: number) => number;
    timer: number | null;
    tries: number;

    constructor(callback: Function, timerCalc: (tries: number) => number);

    reset(): void;
    scheduleTimeout(): void;
  }
}