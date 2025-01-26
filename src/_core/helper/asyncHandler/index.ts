import { Elysia, Context, Handler } from 'elysia'
import _ERROR from '../http-status/error'

type AsyncElysiaHandler<TContext extends Context> = (
  context: TContext['request']
) => Promise<any>

export const asyncHandler = <TContext extends Context>(
  handler: AsyncElysiaHandler<TContext>
): Handler<TContext> => {
  return async (context) => {
    try {
      return await handler(context.request)
    } catch (error) {
      return error instanceof Error
    }
  }
}

// Usage example:
/*
const app = new Elysia()

app.get('/example', 
  asyncHandler(async ({ body, set }) => {
    const data = await someAsyncOperation()
    return { data }
  })
)
*/