import { Frame } from "$/models/Frame.ts"

// deno-lint-ignore no-explicit-any
export const json = (destination: string, headers: PaynalHeaders, body: Record<string, any> = {}): Frame => {
    headers['content-type'] = 'application/json'
    headers['destination'] = destination
    const stringBody = JSON.stringify(body)
    if (body) headers['content-length'] = stringBody.length
    return new Frame('SEND', headers, stringBody)
}
