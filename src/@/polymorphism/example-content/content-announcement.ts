import { type Content, renderHTML } from './content'

export type Announcement = {
  Content: 'announcement'
  title: string
  message: string
}

const isAnnouncement = (content: Content): content is Announcement => content.Content === 'announcement'

renderHTML.implement(isAnnouncement, (announcement) => {
  return `
        <div>
            <h1>${announcement.title}</h1>
            <p>${announcement.message}</p>
        </div>
    `
})

export const Announcement = (input: { title: string; message: string }): Announcement => ({
  ...input,
  Content: 'announcement'
})
