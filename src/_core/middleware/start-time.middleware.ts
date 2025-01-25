import Elysia from "elysia";

// Request timing middleware
export function requestTimingMiddleware() {
  return new Elysia()
    .derive((context) => {
      context.request.headers.set('x-request-start', Date.now().toString());
      return {};
    });
}