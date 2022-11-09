import { cuid } from 'cuid'
import { Break } from '$/utils/bytes.ts'
import { Frame } from '$/models/Frame.ts'
import { SERVER_FRAMES } from '$/frames/server-frames.ts'
import { tokenizeDestination } from '$/utils/tokenizeDestination.ts'
import { checkSubMatchDestination } from '$/utils/checkSubMatchDestination.ts'
import { MiddlewareCommands } from '$/models/MiddlewareCommands.ts'
import { ServerConfig } from '$/models/ServerConfig.ts'
import { PaynalSocketHandler, PaynalSocketHandlerEvents } from '$/PaynalSocketHandler.ts'
import { PaynalEventController } from './PaynalEventController.ts'

export class PaynalServer extends PaynalEventController {

    constructor(
        private readonly serverConfig = ServerConfig,
        private readonly selfSocket = { sessionId: `paynal__${cuid()}` } as IPaynalSocket,
        private subscribers: Subscriber[] = [],
        private readonly paynalSocketHandler: PaynalSocketHandler = new PaynalSocketHandler(serverConfig),
    ) {
        super()
        this.paynalSocketHandler.listen(PaynalSocketHandlerEvents.onClientConnected,
            (socket, headers, heartbeat) => this.onClientConnected(socket, headers, heartbeat))
        this.paynalSocketHandler.listen(PaynalSocketHandlerEvents.onDisconnectClient,
            (socket) => this.onDisconnectClient(socket))
        this.paynalSocketHandler.listen(PaynalSocketHandlerEvents.onSubscribeClient,
            (socket, destination, id) => this.onSubscribeClient(socket, destination, id))
        this.paynalSocketHandler.listen(PaynalSocketHandlerEvents.onUnsubscribeClient,
            (socket, id) => this.onUnsubscribeClient(socket, id))
        this.paynalSocketHandler.listen(PaynalSocketHandlerEvents.onSendClient,
            (socket, topic, frame, callback) => this.onSendClient(socket, topic, frame, callback))
        this.paynalSocketHandler.listen(PaynalSocketHandlerEvents.onHeartbeatOn,
            (socket, intervalTime, serverSide) => this.heartbeatOn(socket, intervalTime, serverSide))
    }

    public register(socket: IPaynalSocket): void {
        socket.onMessage((data) => { this.paynalSocketHandler.listenSocketMessage(socket, data) });
        socket.onClose(() => this.onDisconnectClient(socket));
        socket.onError(() => { });
    }

    public subscribe(topic: string, callback: SubscribeCallback, headers?: PaynalHeaders): SubscriberResponse {
        const id = headers?.id?.toString() ?? cuid()
        const subscriber: Subscriber = {
            topic: topic,
            tokens: tokenizeDestination(topic),
            id: id,
            sessionId: this.selfSocket.sessionId,
            socket: this.selfSocket
        };
        this.subscribers.push(subscriber);
        if (callback) this.on(id, callback)
        return {
            id, unsubscribe: () => {
                this.off(id, () => this.serverConfig.debug("delete event", id))
                this.onUnsubscribeClient(this.selfSocket, id);
            }
        };
    }

    public sendMessage(topic: string, headers: PaynalHeaders = {}, body?: string): void {
        const middleware = this.withMiddleware(MiddlewareCommands.send, () => {
            this.subscribers.forEach(subscriber => {
                if (this.selfSocket.sessionId === subscriber.sessionId) return
                if (!checkSubMatchDestination(subscriber, topic)) return
                if (!subscriber.socket) return
                const frame = SERVER_FRAMES.message(subscriber.id, topic, body, headers)
                this.emit(MiddlewareCommands.send, { topic, frame })
                this.emit(subscriber.id, frame)
                subscriber.socket.sendFrame(frame)
            })
        })
        middleware(this.selfSocket, {})
    }

    protected onSendClient(socket: IPaynalSocket, topic: string, frame: Frame, callback?: (res: boolean) => void) {
        const middleware = this.withMiddleware(MiddlewareCommands.send, (_socket, _args, callback) => {
            this.subscribers.forEach(subscriber => {
                if (socket.sessionId === subscriber.sessionId) return
                if (!checkSubMatchDestination(subscriber, topic)) return
                if (!subscriber.socket) return
                const messageFrame = SERVER_FRAMES.message(subscriber.id, topic, frame.body, frame.headers)
                this.emit(MiddlewareCommands.send, { topic, frame: messageFrame })
                this.emit(subscriber.id, messageFrame.body, messageFrame.headers)
                if (this.selfSocket.sessionId != subscriber.socket.sessionId)
                    subscriber.socket.sendFrame(messageFrame)
            })
            if (callback) callback(true)
        })
        middleware(socket, {}, callback)
    }

    protected onSubscribeClient(socket: IPaynalSocket, destination: string, id: string) {
        const middleware = this.withMiddleware(MiddlewareCommands.subscribe,
            (socket, { destination, id }: { destination: string, id: string }) => {
                const sub: Subscriber = {
                    id: id,
                    sessionId: socket.sessionId,
                    topic: destination,
                    tokens: tokenizeDestination(destination),
                    socket: socket
                }
                this.subscribers.push(sub)
                this.emit(MiddlewareCommands.subscribe, sub)
                this.serverConfig.debug(MiddlewareCommands.subscribe, id, destination)
            })
        middleware(socket, { destination, id })
    }

    protected onUnsubscribeClient(socket: IPaynalSocket, id: string) {
        const middleware = this.withMiddleware(MiddlewareCommands.unsubscribe, (socket: IPaynalSocket, { id }: { id: string }) => {
            this.subscribers = this.subscribers.filter(subscriber => {
                const unsubscribe = subscriber.id == id && subscriber.sessionId == socket.sessionId
                return !unsubscribe
            })
        })
        middleware(socket, { id })
    }

    protected onClientConnected(socket: IPaynalSocket, headers: PaynalHeaders, heartbeat: number[]) {
        const middleware = this.withMiddleware(MiddlewareCommands.connect,
            (socket, { heartbeat, headers }: { heartbeat: number[], headers: PaynalHeaders }) => {
                socket.clientHeartbeat.client = heartbeat[0]
                socket.clientHeartbeat.server = heartbeat[1]
                this.serverConfig.debug('CONNECT', socket.sessionId, socket.clientHeartbeat, headers)
                this.emit(MiddlewareCommands.connect, socket.sessionId, headers)
            })
        middleware(socket, { headers, heartbeat })
    }

    protected onDisconnectClient(socket: IPaynalSocket) {
        const withMiddleware = this.withMiddleware(MiddlewareCommands.disconnect, (socket) => {
            this.afterConnectionClose(socket)
            this.serverConfig.debug(MiddlewareCommands.disconnect, socket.sessionId)
            this.emit(MiddlewareCommands.disconnect, socket.sessionId)
        })
        withMiddleware(socket, undefined)
    }

    protected afterConnectionClose(socket: IPaynalSocket) {
        this.subscribers = this.subscribers
            .filter(subscriber =>
                subscriber.sessionId !== socket.sessionId)
        this.heartbeatOff(socket)
    }


    protected heartbeatOff(socket: IPaynalSocket) {
        if (!socket.heartbeatClock) return
        clearInterval(socket.heartbeatClock)
        socket.heartbeatClock = undefined
    }

    protected heartbeatOn(socket: IPaynalSocket, intervalTime: number, serverSide: boolean) {
        if (serverSide) {
            socket.heartbeatClock = setInterval(() => {
                this.serverConfig.debug('PING')
                socket.send(Break)
            }, intervalTime)
            return
        }
        socket.heartbeatTime = Date.now() + intervalTime
        socket.heartbeatClock = setInterval(() => {
            const diff = Date.now() - socket.heartbeatTime
            if (diff > intervalTime + this.serverConfig.heartbeatErrorMargin) {
                this.serverConfig.debug('HEALTH CHECK failed! Closing', diff, intervalTime)
                socket.close()
            } else {
                this.serverConfig.debug('HEALTH CHECK ok!', diff, intervalTime)
                socket.heartbeatTime -= diff
            }
        }, intervalTime)
    }
}
