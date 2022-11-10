import { Frame } from "$/models/Frame.ts"

export const ack = (id: string, headers: PaynalHeaders, transaction?: string): Frame => {
    headers.id = id
    if (transaction) headers.transaction = transaction
    return new Frame('ACK', headers)
}
