import { Null } from "./bytes.ts"

export const trimNull = (payload: string): string => {
    const c = payload.indexOf(Null)
    if (c > -1) return payload.slice(0, c)
    return payload
}
