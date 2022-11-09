import { Frame } from "$/models/Frame.ts"

export const receip = (receipt: string): Frame => {
    return new Frame('RECEIPT', { 'receipt-id': receipt })
}
