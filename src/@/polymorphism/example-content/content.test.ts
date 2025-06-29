import { describe, expect, test } from '~/@/test-runner'
import { renderHTML } from './content'
import { Announcement } from './content-announcement'
import { BlogPost } from './content-blog-post'
import { Video } from './content-video'

const feed = [
  BlogPost({
    title: 'Hello World',
    body: 'This is my first blog post',
  }),
  Video({
    title: 'My Video',
    message: 'This is my video',
    videoSrc: 'https://www.youtube.com/watch?v=1234',
  }),
  BlogPost({
    title: 'Another Post',
    body: 'This is my second blog post',
  }),
  Announcement({
    title: 'Important Announcement',
    message: 'This is important',
  }),
]

describe('Content', () => {
  test('should render html string', async () => {
    feed.forEach((content) => {
      expect(typeof renderHTML(content)).toEqual('string')
    })
  })
})
