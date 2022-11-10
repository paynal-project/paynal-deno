import { cuid } from 'cuid'
import { Frame } from '$/models/Frame.ts'

export const subscribe = (destination: string, headers: PaynalHeaders): Frame => {
    headers.destination = destination
    headers.id = cuid()
    /**
     * TODO: revisar la documentacion de ack
     */
    // headers.ack = 'client'
    return new Frame('SUBSCRIBE', headers)
}
