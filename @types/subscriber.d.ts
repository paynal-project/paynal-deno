type Subscriber = { id: string, sessionId: string, topic: string, tokens: string[], socket: IPaynalSocket }
type SubscriberResponse = { id: string, unsubscribe: () => void }
type SubscribeCallback = (msg: string, headers: PaynalHeaders) => void
