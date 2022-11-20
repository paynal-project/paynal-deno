import { assertEquals } from "https://deno.land/std@0.163.0/testing/asserts.ts";
import { tokenizeDestination } from '$/utils/tokenizeDestination.ts'

Deno.test("tokenizeDestination single token", () => {
    const expectedResponse = ['token/example/test']

    const tokens = tokenizeDestination('/token/example/test')

    assertEquals(tokens.toString(), expectedResponse.toString())
})

Deno.test("tokenizeDestination multi token", () => {
    const expectedResponse = ['token/example/test', 'token', 'example']

    const tokens = tokenizeDestination('/token/example/test.token.example')

    assertEquals(tokens.toString(), expectedResponse.toString())
})
