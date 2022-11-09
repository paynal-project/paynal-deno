export interface IServerConfig {
    heartBeat: [number, number]
    heartbeatErrorMargin: number
    // deno-lint-ignore no-explicit-any
    debug: (message?: any, ...optionalParams: any[]) => void
    serverName: string
}

export const ServerConfig: IServerConfig = {
    heartBeat: [0, 0],
    heartbeatErrorMargin: 1000,
    debug: console.log,
    serverName: 'Paynal/0.0.1',
}