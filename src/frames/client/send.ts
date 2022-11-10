import { Frame } from "$/models/Frame.ts"

export const send = (destination: string, headers: PaynalHeaders, body?: string): Frame => {
    headers.destination = destination
    if (body) headers['content-length'] = body.length
    return new Frame('SEND', headers, body)
}
