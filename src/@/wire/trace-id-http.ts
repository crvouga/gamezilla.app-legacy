import { TraceId } from './trace-id'

const HEADER_NAME = 'X-Trace-Id'

const fromRequest = (request: Request): TraceId => {
  const traceId = request.headers?.get(HEADER_NAME)

  if (traceId) {
    return traceId as TraceId
  }

  return TraceId.generate()
}

const addToResponse = (response: Response, traceId: TraceId) => {
  response.headers.set(HEADER_NAME, traceId)
}

export const TraceIdHttp = {
  HEADER_NAME,
  fromRequest,
  addToResponse,
}
