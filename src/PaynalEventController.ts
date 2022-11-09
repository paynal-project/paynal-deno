import EventEmitter from 'EventEmitter'
import { MiddlewareCommands } from '$/models/MiddlewareCommands.ts'
import { Middleware } from "../@types/middleware.d.ts";

export abstract class PaynalEventController extends EventEmitter {
    constructor(
        readonly middlewares: Map<MiddlewareCommands, Middleware[]> = new Map(),
    ) { super() }

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