type PaynalHeaders = { [x: string]: string | number | boolean }

interface ClientHeartbeat {
    client: number
    server: number
}

interface IPaynalSocket {
    readonly sessionId: string
    heartbeatClock?: number
    heartbeatTime: number
    clientHeartbeat: ClientHeartbeat

    on(event: string, listener: (data: string, isBinary: boolean) => void): WebSocket
    // TODO: Fix frame type
    sendFrame(frame: any): void
    send(payload: any): void
    close(): void
}
