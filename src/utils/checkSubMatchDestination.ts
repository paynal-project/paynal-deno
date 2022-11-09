import { tokenizeDestination } from '$/utils/tokenizeDestination.ts'

export const checkSubMatchDestination = (subscriber: Subscriber, dest: string): boolean => {
    let match = true
    const tokens = tokenizeDestination(dest)
    for (const t in tokens) {
        const token = tokens[t]
        if (subscriber.tokens[t] === undefined || (subscriber.tokens[t] !== token && subscriber.tokens[t] !== '*' && subscriber.tokens[t] !== '**')) {
            match = false
            break
        } else if (subscriber.tokens[t] === '**') {
            break
        }
    }
    return match
}
