import { Frame } from "$/models/Frame.ts"

export const error = (message: string, description: string): Frame => {
    const len = description === undefined ? 0 : description.length
    const headers = {
        message: message,
        'content-type': 'text/plain',
        'content-length': len
    }
    return new Frame('ERROR', headers, description)
}
