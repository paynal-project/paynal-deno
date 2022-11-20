import { assertEquals } from "https://deno.land/std@0.163.0/testing/asserts.ts";
import { checkSubMatchDestination } from '$/utils/checkSubMatchDestination.ts'
import { tokenizeDestination } from '$/utils/tokenizeDestination.ts'

Deno.test("checkSubMatchDestination single token", () => {
    const expectedResponse = true
    const destination = '/token/example'
    const subscriber: Subscriber = {
        id: 'id__00',
        sessionId: 'paynal__00',
        socket: {} as IPaynalSocket,
        tokens: tokenizeDestination(destination),
        topic: 'topic'
    }
    const response = checkSubMatchDestination(subscriber, destination)

    assertEquals(response, expectedResponse)
})

Deno.test("checkSubMatchDestination multi tokens", () => {
    const expectedResponse = true
    const destination = '/token/example'
    const subscriber: Subscriber = {
        id: 'id__00',
        sessionId: 'paynal__00',
        socket: {} as IPaynalSocket,
        tokens: tokenizeDestination(destination),
        topic: destination
    }
    const response = checkSubMatchDestination(subscriber, destination)

    assertEquals(response, expectedResponse)
})

Deno.test("checkSubMatchDestination fail token", () => {
    const expectedResponse = false
    const destination = '/example/token'
    const subscriber: Subscriber = {
        id: 'id__00',
        sessionId: 'paynal__00',
        socket: {} as IPaynalSocket,
        tokens: tokenizeDestination('/token/example'),
        topic: destination
    }
    const response = checkSubMatchDestination(subscriber, destination)

    assertEquals(response, expectedResponse)
})
