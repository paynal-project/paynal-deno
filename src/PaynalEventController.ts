import EventEmitter from 'EventEmitter'
import { MiddlewareCommands } from '$/models/MiddlewareCommands.ts'

export abstract class PaynalEventController extends EventEmitter {
    private middlewares: Map<MiddlewareCommands, Middleware[]> = new Map<MiddlewareCommands, Middleware[]>()

    public addMiddleware(command: MiddlewareCommands, handler: Middleware): void {
        if (!this.middlewares.get(command)) this.middlewares.set(command, [])
        this.middlewares.get(command)!.push(handler)
    }

    protected withMiddleware(command: MiddlewareCommands, handler: Middleware): Middleware {
        return (socket, args, callback) => {
            const handlers = this.middlewares.get(command) || []
            handlers.forEach(middleware => middleware(socket, args))
            handler(socket, args, callback)
        }
    }
}