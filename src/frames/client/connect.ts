import { Frame } from "$/models/Frame.ts"

export const connect = (login: string, passcode: string, headers?: PaynalHeaders): Frame => {
    const _headers: PaynalHeaders = {
        ...headers,
        'accept-version': 1.2,
        login,
        passcode
    }
    return new Frame('CONNECT', _headers)
}
