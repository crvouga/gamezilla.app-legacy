import { type Content, renderHTML } from "./content";

export type Video = {
	Content: "video";
	title: string;
	message: string;
	videoSrc: string;
};

const isVideo = (content: Content): content is Video =>
	content.Content === "video";

renderHTML.implement(isVideo, (video) => {
	return `
        <div>
            <h1>${video.title}</h1>
            <p>${video.message}</p>
        </div>
    `;
});

export const Video = (input: {
	title: string;
	message: string;
	videoSrc: string;
}): Video => ({
	...input,
	Content: "video",
});
