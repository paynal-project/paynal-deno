export interface IServerConfig {
    heartBeat: [number, number]
    heartbeatErrorMargin: number
    // deno-lint-ignore no-explicit-any
    debug: (message?: any, ...optionalParams: any[]) => void
    serverName: string
    credentials: {
        user: string
        password: string
    }
}

export interface IServerConfigOptionals {
    heartBeat?: [number, number]
    heartbeatErrorMargin?: number
    // deno-lint-ignore no-explicit-any
    debug?: (message?: any, ...optionalParams: any[]) => void
    serverName?: string
    credentials?: {
        user?: string
        password?: string
    }
}

export const DefaultServerConfig: IServerConfig = {
    heartBeat: [0, 0],
    heartbeatErrorMargin: 1000,
    debug: (message, ...optionalParams) => console.log('[PaynalServer]', Date.now(), message, ...optionalParams),
    serverName: 'Paynal/0.0.1',
    credentials: {
        user: '',
        password: '',
    },
}