import { expect, test } from "bun:test"
import { renderHTML } from "./content"
import { Announcement } from "./content-announcement"
import { BlogPost } from "./content-blog-post"

const feed = [
  BlogPost({ title: "Hello World", body: "This is my first blog post" }),
  BlogPost({ title: "Another Post", body: "This is my second blog post" }),
  Announcement({
    title: "Important Announcement",
    message: "This is important",
  }),
]

test("render html", () => {
  feed.forEach((content) => {
    expect(renderHTML(content)).toBeString()
  })
})
