type PaynalHeaders = { [x: string]: string | number | boolean }

interface ClientHeartbeat {
    client: number
    server: number
}

interface IPaynalSocket {
    sessionId: string
    heartbeatClock?: number
    heartbeatTime: number
    clientHeartbeat: ClientHeartbeat
    onMessage: (callback: (payload: string) => void) => void
    onClose: (callback: () => void) => void
    onError: (callback: (error: string) => void) => void
    // TODO: Fix frame type
    sendFrame: (frame: any) => void
    send: (payload: any) => void
    close: () => void
}
