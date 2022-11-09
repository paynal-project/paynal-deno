import { Frame } from "$/models/Frame.ts"

export const connected = (sessionId: string, heartbeat: string, serverName: string): Frame => {
    const headers = {
        session: sessionId,
        server: serverName,
        'heart-beat': heartbeat,
        version: '1.2'
    }
    return new Frame('CONNECTED', headers)
}