import { cuid } from 'cuid'
import { Frame } from '$/models/Frame.ts'


export class PaynalSubscriber implements IPaynalSocket {
    sessionId = cuid();
    isLogin = false
    heartbeatClock?: number | undefined;
    heartbeatTime = 0;
    clientHeartbeat: ClientHeartbeat = {
        client: 0,
        server: 0,
    }

    private constructor(
        private readonly webSocket: WebSocket
    ) { }

    static overWebSocket(ws: WebSocket): PaynalSubscriber {
        return new PaynalSubscriber(ws)
    }

    onMessage(callback: (payload: string) => void): void {
        this.webSocket.onmessage = payload => callback(payload.data)
    }

    onClose(callback: () => void): void {
        this.webSocket.onclose = callback
    }

    onError(callback: (error: string) => void): void {
        this.webSocket.onerror = error => callback(error.type)
    }

    sendFrame(frame: Frame): void {
        this.webSocket.send(frame.toString())
    }

    send(payload: string) {
        this.webSocket.send(payload)
    }

    close() {
        this.webSocket.close()
    }
}