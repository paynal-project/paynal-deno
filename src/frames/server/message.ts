import { cuid } from "cuid"
import { Frame } from "$/models/Frame.ts"

export const message = (subscription: string, destination: string, body?: string, headers?: PaynalHeaders): Frame => {
    headers = {
        'message-id': cuid(),
        subscription,
        destination,
        ...headers
    }
    return new Frame('MESSAGE', headers, body)
}
