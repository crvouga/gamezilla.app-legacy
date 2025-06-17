import { isErr } from '~/@/result'
import { uploadDataRegistry } from '~/@/upload-data/upload-data-registry'
import { RequestBody } from './types'

const respond = async (input: { req: Request }): Promise<Response | null> => {
  const body = await input.req.json()

  const parsed = RequestBody.parse(body)

  if (isErr(parsed)) {
    return new Response(JSON.stringify(parsed), { status: 400 })
  }

  for (const entry of parsed.value.crudTransaction.entries) {
    for (const uploadData of uploadDataRegistry.values()) {
      if (uploadData.match(entry)) {
        const uploaded = await uploadData.upload(entry)
        if (isErr(uploaded)) {
          return new Response(JSON.stringify(uploaded), { status: 500 })
        }
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

export const PowerSyncUploadDataBackend = {
  respond,
}
