import { Frame } from "$/models/Frame.ts"

export const disconnect = (receipt: string): Frame => {
    return new Frame('DISCONNECT', { receipt })
}
