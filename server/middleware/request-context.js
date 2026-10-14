import { randomUUID } from 'node:crypto';

export function requestContext(request, response, next) {
  request.requestId = randomUUID();
  response.setHeader('X-Request-Id', request.requestId);
  next();
}
