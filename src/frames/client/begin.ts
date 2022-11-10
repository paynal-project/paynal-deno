import { Frame } from "$/models/Frame.ts"

export const begin = (transaction: string, headers: PaynalHeaders): Frame => {
    headers.transaction = transaction
    return new Frame('BEGIN', headers)
}
