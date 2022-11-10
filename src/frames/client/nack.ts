import { Frame } from "$/models/Frame.ts"

export const nack = (id: string, headers: PaynalHeaders, transaction?: string): Frame => {
    headers.id = id
    if (transaction) headers.transaction = transaction
    return new Frame('NACK', headers)
}
