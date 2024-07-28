type OperationTypes = {
  Request: any
  Response: any
}

export const WorkerRPC = <TOperationTypes extends OperationTypes>({ filePath }: { filePath: string }) => {
  const worker = new Worker(filePath)

  return async (request: TOperationTypes['Request']): Promise<TOperationTypes['Response']> => {
    const responsePromise = new Promise<TOperationTypes['Response']>((resolve) => {
      worker.onmessage = (event) => {
        const msg = event.data
        if (msg.t === 'response') {
          resolve(msg.response)
        }
      }
    })

    worker.postMessage({
      t: 'request',
      request
    })

    const response = await responsePromise

    return response
  }
}
