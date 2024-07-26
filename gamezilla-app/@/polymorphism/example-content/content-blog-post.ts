import {type Content, renderHTML} from './content';

export type BlogPost = {
	Content: 'blog-post';
	title: string;
	body: string;
};

const isBlogPost = (content: Content): content is BlogPost =>
	content.Content === 'blog-post';

renderHTML.implement(isBlogPost, (blogPost) => {
	return `
    <div>
        <h1>${blogPost.title}</h1>
        <p>${blogPost.body}</p>
    </div>
    `;
});

export const BlogPost = (input: {title: string; body: string}): BlogPost => ({
	...input,
	Content: 'blog-post',
});
