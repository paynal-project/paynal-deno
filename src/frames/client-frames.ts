import { connect } from '$/frames/client/connect.ts'
import { stomp } from '$/frames/client/stomp.ts'
import { send } from '$/frames/client/send.ts'
import { subscribe } from '$/frames/client/subscribe.ts'
import { unsubscribe } from '$/frames/client/unsubscribe.ts'
import { begin } from '$/frames/client/begin.ts'
import { commit } from '$/frames/client/commit.ts'
import { abort } from '$/frames/client/abort.ts'
import { ack } from '$/frames/client/ack.ts'
import { nack } from '$/frames/client/nack.ts'
import { disconnect } from '$/frames/client/disconnect.ts'

export const CLIENT_FRAMES = {
    connect,
    stomp,
    send,
    subscribe,
    unsubscribe,
    begin,
    commit,
    abort,
    ack,
    nack,
    disconnect,
}
