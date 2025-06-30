import { s } from '../schema'

const schema = s.enumeration([
  'interaction.tap',
  'interaction.navigate',
  'interaction.input',
  'feedback.positive',
  'feedback.negative',
])

export type SoundTag = s.Infer<typeof schema>

export const SoundTag = {
  ...schema,
}
