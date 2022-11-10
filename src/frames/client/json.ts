import { Frame } from "$/models/Frame.ts"

export const json = (destination: string, headers: PaynalHeaders, body?: string): Frame => {
    headers['content-type'] = 'application/json'
    headers['destination'] = destination
    if (body) headers['content-length'] = body.length
    return new Frame('SEND', headers, body)
}
