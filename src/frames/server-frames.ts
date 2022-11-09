import { connected } from '$/frames/server/connected.ts'
import { message } from '$/frames/server/message.ts'
import { receip } from '$/frames/server/receip.ts'
import { error } from '$/frames/server/error.ts'

export const SERVER_FRAMES = {
    connected,
    message,
    receip,
    error
}
