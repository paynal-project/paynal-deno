import { Break, Null } from '$/utils/bytes.ts'
import { trimNull } from '$/utils/trimNull.ts'

export class Frame {
    constructor(
        readonly command: string,
        readonly headers: PaynalHeaders,
        readonly body?: string,
    ) { }

    public static fromString(payload: string): Frame {
        const [commandAndHeaders, rawBody] = payload.split(`${Break}${Break}`)
        const [command, ...strHeaders] = commandAndHeaders.split(Break)
        const body = trimNull(rawBody)
        const headers: PaynalHeaders = {}
        strHeaders.forEach((strHeader: string) => {
            const [key, value] = strHeader.split(':')
            headers[key] = value
        })
        return new Frame(command, headers, body)
    }

    public toString(): string {
        const frameBuilder = []
        const headersBuilder = Object.entries(this.headers)
            .map(([headerKey, headerValue]) =>
                `${headerKey}:${headerValue}`)
        frameBuilder.push(this.command)
        frameBuilder.push(headersBuilder.join(Break))
        frameBuilder.push(Break)
        if (this.body) frameBuilder.push(this.body)
        frameBuilder.push(Null)
        return frameBuilder.join(Break)
    }
}
