import { ClientModule } from "../../builder.core"
import { PackCreateClient } from "../create/pack-create.client"

export const update: ClientModule["update"] = (input) => {
  return { model: input.model }
}

export const View: ClientModule["View"] = (input) => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      packs
      <div className="absolute bottom-5 right-5 bg-black">
        <PackCreateClient.ViewCreateButton {...input} />
      </div>
    </div>
  )
}

export const PackListClient = {
  View,
  update,
}
