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

feed.forEach((content) => {
  console.log(renderHTML(content))
})
