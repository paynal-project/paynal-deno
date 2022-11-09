// deno-lint-ignore-file no-explicit-any
export type Middleware = (socket: IPaynalSocket, args: any, callback?: (message?: any, ...optionalParams: any[]) => void) => void
