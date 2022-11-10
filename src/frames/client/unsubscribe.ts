import { Frame } from '$/models/Frame.ts'

export const unsubscribe = (id: string): Frame => {
    return new Frame('UNSUBSCRIBE', { id })
}
