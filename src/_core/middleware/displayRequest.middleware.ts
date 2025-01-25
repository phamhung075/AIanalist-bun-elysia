import { isEmpty } from 'lodash';
import {
  bgMagenta,
  bgWhite,
  blue,
  blueBright,
  greenBright,
  yellow,
} from 'colorette';

export function displayRequest(request: Request, requestTimes: Map<string, number>): void {
  const url = new URL(request.url);
  const timestamp = new Date().toLocaleString();
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const startTime = requestTimes.get(requestId);
  const elapsedTime = startTime ? Date.now() - startTime : undefined;
  
  console.log(bgWhite("\n" + "showRequest: " + timestamp));
  console.log("Request ID:", requestId);
  if (elapsedTime) {
    console.log("Request Duration:", `${elapsedTime}ms`);
  }
  console.log(
    "Request URL:",
    `${blueBright(url.host)}${blue(url.pathname + url.search)}`
  );
  console.log("Method:", yellow(request.method));
  
  try {
    const clone = request.clone();
    clone.json().then(body => {
      if (!isEmpty(body)) {
        console.log("Body:", greenBright(JSON.stringify(body, null, 2)));
      }
    });
  } catch {}
  
  const query = Object.fromEntries(url.searchParams);
  if (!isEmpty(query)) {
    console.log("Query:", JSON.stringify(query, null, 2));
  }
  
  console.log(bgMagenta("\n"));
}