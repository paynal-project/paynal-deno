export const tokenizeDestination = (dest: string): string[] => {
    return dest.slice(dest.indexOf('/') + 1).split('.')
}
