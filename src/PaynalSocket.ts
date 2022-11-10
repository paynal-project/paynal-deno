import EventEmitter from 'EventEmitter'
import { Frame } from '$/models/Frame.ts'
import { CLIENT_FRAMES } from '$/frames/client-frames.ts'
import { cuid } from 'https://deno.land/x/cuid@v1.0.0/index.js';

abstract class PaynalSocketBase extends EventEmitter {
    protected readonly ws: WebSocket

    constructor(
        readonly url: string
    ) {
        super();
        this.ws = new WebSocket(url)
    }
}

export class PaynalSocket extends PaynalSocketBase {
    private _isLogin = false
    private _session = 'paynal-anonymous-00'
    private _server = ''
    private _onError?: (frame: Frame) => void

    constructor(
        readonly url: string,
    ) {
        super(url)
        this.ws.onmessage = (payload) => this.listener(payload.data)
    }

    protected listener(payload: string) {
        const frame = Frame.fromString(payload)
        switch (frame.command) {
            case 'CONNECTED': {
                this._isLogin = true
                this._session = frame.headers.session as string
                break;
            }
            case 'MESSAGE': {
                this.emit(frame.headers.subscription as string, frame.body, frame.headers)
                break;
            }
            case 'RECEIPT': {
                const receiptId = frame.headers['receipt-id'] as string
                this.emit(receiptId, true)
                break;
            }
            case 'ERROR': {
                const receiptId = frame.headers['receipt-id'] as string
                this.emit(receiptId, false)
                if (this._onError) this._onError(frame)
                break;
            }
            default: {
                console.log('[PaynalSocket] command frame not found')
                console.log(frame)
            }
        }
    }

    public stomp(login: string, passcode: string, headers?: PaynalHeaders) {
        const frame = CLIENT_FRAMES.stomp(login, passcode, headers)
        return this._connect(frame)
    }

    public connect(login: string, passcode: string, headers?: PaynalHeaders) {
        const frame = CLIENT_FRAMES.connect(login, passcode, headers)
        return this._connect(frame)
    }

    protected _connect(frame: Frame) {
        const receipt = cuid()
        return new Promise<void>(resolve => {
            if (this._isLogin) resolve()
            const timeout = setTimeout(() => resolve(), 4000)
            frame.headers.receipt = receipt
            this.sendFrame(frame)
            this.once(receipt, () => {
                resolve()
                clearTimeout(timeout)
            })
        })
    }

    public send(destination: string, headers: PaynalHeaders, body?: string) {
        if (!this._isLogin) return
        const frame = CLIENT_FRAMES.send(destination, headers, JSON.stringify(body))
        this.sendFrame(frame)
    }

    // deno-lint-ignore no-explicit-any
    public json(destination: string, headers: PaynalHeaders, body?: Record<string, any>) {
        if (!this._isLogin) return
        const frame = CLIENT_FRAMES.json(destination, headers, body)
        this.sendFrame(frame)
    }

    public subscribe(destination: string, callback?: SubscribeCallback, headers: PaynalHeaders = {}) {
        const frame = CLIENT_FRAMES.subscribe(destination, headers)
        const id = frame.headers.id as string
        this.sendFrame(frame)
        if (callback) this.on(id, callback)
        return {
            id,
            unsubscribe: () => this.unsubscribe(id)
        }
    }

    protected unsubscribe(id: string) {
        const frame = CLIENT_FRAMES.unsubscribe(id)
        this.sendFrame(frame)
    }

    public waitToConnect() {
        return new Promise<boolean>((resolve) => {
            const timeout = setTimeout(() => resolve(false), 5000)
            this.ws.onopen = () => {
                clearTimeout(timeout)
                resolve(true)
            }
        })
    }

    public onError(listener: (frame: Frame) => void) {
        this._onError = listener
    }

    protected sendFrame(frame: Frame) {
        this.ws.send(frame.toString())
    }

    get isConnected() {
        return this._isLogin
    }

    get server() {
        return this._server
    }

    get session() {
        return this._session
    }
}
