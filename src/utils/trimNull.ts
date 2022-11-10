import { Null, Break } from "$/utils/bytes.ts"

export const trimNull = (payload: string): string => {
    payload = payload.replaceAll(Null, '')
    payload = payload.replaceAll(Break, '')
    return payload
}
