import { Frame } from "$/models/Frame.ts"

export const abort = (transaction: string, headers: PaynalHeaders): Frame => {
    headers.transaction = transaction
    return new Frame('ABORT', {})
}
