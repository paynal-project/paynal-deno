import EventEmitter from 'EventEmitter'
import { Frame } from '$/models/Frame.ts'
import { Break } from '$/utils/bytes.ts'
import { SERVER_FRAMES } from '$/frames/server-frames.ts'
import { DefaultServerConfig } from '$/models/ServerConfig.ts'

export enum PaynalSocketHandlerEvents {
    onClientConnected = 'onClientConnected',
    onDisconnectClient = 'onDisconnectClient',
    onSubscribeClient = 'onSubscribeClient',
    onUnsubscribeClient = 'onUnsubscribeClient',
    onSendClient = 'onSendClient',
    onHeartbeatOn = 'onHeartbeatOn',
    onError = 'onError',
}

export class PaynalSocketHandler extends EventEmitter {

    constructor(
        private readonly serverConfig = DefaultServerConfig
    ) { super() }

    public listenSocketMessage(socket: IPaynalSocket, payload: string): void {
        if (socket.heartbeatClock) {
            // beat
            socket.heartbeatTime = Date.now()
            // if it's ping then ignore
            if (payload === Break) {
                console.log(Break)
                return
            }
        }

        const frame = Frame.fromString(payload)

        if (frame.command != 'STOMP' && frame.command != 'CONNECT' && !socket.isLogin) {
            this.emit(PaynalSocketHandlerEvents.onError, socket, 'Not logged in yet', 'not logged in yet', frame)
            return
        }

        switch (frame.command) {
            case 'STOMP':
            case 'CONNECT': return this.connect(socket, frame)
            case 'DISCONNECT': return this.disconnect(socket, frame)
            case 'SUBSCRIBE': return this.subscribe(socket, frame)
            case 'UNSUBSCRIBE': return this.unsubscribe(socket, frame)
            case 'SEND': return this.send(socket, frame)
            default: {
                this.emit(
                    PaynalSocketHandlerEvents.onError,
                    socket,
                    'Command not found',
                    `Command not found: ${Break}-----${Break}${frame.command}${Break}-----`,
                    frame
                )
            }
        }
    }

    listen(event: PaynalSocketHandlerEvents.onClientConnected, listener: (socket: IPaynalSocket, headers: PaynalHeaders, clientHeartbeat: number[]) => void): void
    listen(event: PaynalSocketHandlerEvents.onDisconnectClient, listener: (socket: IPaynalSocket, receip: string) => void): void
    listen(event: PaynalSocketHandlerEvents.onSubscribeClient, listener: (socket: IPaynalSocket, destination: string, id: string) => void): void
    listen(event: PaynalSocketHandlerEvents.onUnsubscribeClient, listener: (socket: IPaynalSocket, id: string) => void): void
    listen(event: PaynalSocketHandlerEvents.onSendClient, listener: (socket: IPaynalSocket, destination: string, frame: Frame, callback?: (boolean: boolean) => void) => void): void
    listen(event: PaynalSocketHandlerEvents.onHeartbeatOn, listener: (socket: IPaynalSocket, intervalTime: number, serverSide: boolean) => void): void
    listen(event: PaynalSocketHandlerEvents.onError, listener: (socket: IPaynalSocket, message: string, description: string, frame: Frame) => void): void
    // deno-lint-ignore ban-types
    listen(event: PaynalSocketHandlerEvents, listener: Function): void {
        this.on(event, listener);
    }

    protected connect(socket: IPaynalSocket, frame: Frame) {
        if (
            frame.headers.login != this.serverConfig.credentials.user
            || frame.headers.passcode != this.serverConfig.credentials.password
        ) {
            this.emit(PaynalSocketHandlerEvents.onError, socket, 'Incorrect Credentials', 'user or password error', frame)
            return
        }

        const rawHeartbeat = frame.headers['heart-beat']
        let clientHeartbeat = [0, 0]
        if (rawHeartbeat) {
            clientHeartbeat = rawHeartbeat.toString().split(',').map((x) => parseInt(x))
        }
        const heartBeat = [0, 0]
        // check preferred heart-beat direction: client → server
        if (clientHeartbeat[0] > 0 && this.serverConfig.heartBeat[1] > 0) {
            heartBeat[1] = Math.max(clientHeartbeat[0], this.serverConfig.heartBeat[1])
            this.emit(PaynalSocketHandlerEvents.onHeartbeatOn, socket, heartBeat[1], false)
        }
        // check non-preferred heart-beat direction: server → client
        else if (clientHeartbeat[1] > 0 && this.serverConfig.heartBeat[0] > 0) {
            heartBeat[0] = Math.max(clientHeartbeat[1], this.serverConfig.heartBeat[0])
            this.emit(PaynalSocketHandlerEvents.onHeartbeatOn, socket, heartBeat[0], true)
        }
        this.emit(PaynalSocketHandlerEvents.onClientConnected, socket, frame.headers, clientHeartbeat)
        const connectedFrame = SERVER_FRAMES.connected(socket.sessionId, clientHeartbeat.join(','), this.serverConfig.serverName)
        socket.isLogin = true
        socket.sendFrame(connectedFrame)
        const receipt = frame.headers.receipt as string
        if (!receipt) return
        const receipFrame = SERVER_FRAMES.receip(receipt)
        socket.sendFrame(receipFrame)
    }

    protected disconnect(socket: IPaynalSocket, frame: Frame) {
        const receipt = frame.headers.receipt as string
        this.emit(PaynalSocketHandlerEvents.onDisconnectClient, socket, receipt)
        const receipFrame = SERVER_FRAMES.receip(receipt)
        socket.sendFrame(receipFrame)
    }

    protected subscribe(socket: IPaynalSocket, frame: Frame) {
        const destination = frame.headers.destination as string
        const id = frame.headers.id as string
        /**
         * The valid values for the ack header are **auto**, **client**, or **client-individual**. If the header is not set, it defaults to auto.
         * Please check [SUBSCRIBE Doc](https://stomp.github.io/stomp-specification-1.2.html#SUBSCRIBE)
         */
        const ack = frame.headers?.ack || 'auto'
        this.emit(PaynalSocketHandlerEvents.onSubscribeClient, socket, destination, id)
    }

    protected unsubscribe(socket: IPaynalSocket, frame: Frame) {
        const id = frame.headers.id as string
        this.emit(PaynalSocketHandlerEvents.onUnsubscribeClient, socket, id)
    }

    protected send(socket: IPaynalSocket, frame: Frame) {
        if (!frame.headers.destination) {
            this.emit(PaynalSocketHandlerEvents.onError, socket, 'Header destination is required',
                `Header destination not found:\n-----\n${frame.toString()}\n-----`, frame)
            return
        }
        const destination = frame.headers.destination as string
        this.emit(PaynalSocketHandlerEvents.onSendClient, socket, destination, frame, (res: boolean) => {
            const receip = frame.headers.receipt
            if (res && receip)
                return socket.sendFrame(SERVER_FRAMES.receip(receip as string))
            if (!res)
                this.emit(PaynalSocketHandlerEvents.onError, socket, 'error', frame.toString(), frame)
        })
    }
}