import { VDomChildren } from "gamezilla-app/@/vdom";
import { register } from "swiper/element/bundle";

register();

if (typeof window !== "undefined") {
	register();
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"swiper-container": any;
			"swiper-slide": any;
		}
	}
}

const Container = (props: { children?: VDomChildren; className?: string }) => {
	return (
		<swiper-container
			slides-per-view="auto"
			className={props.className}
			grab-cursor
			centered-slides
		>
			{props.children}
		</swiper-container>
	);
};

const Slide = (props: { children?: VDomChildren; className?: string }) => {
	return (
		<swiper-slide className={props.className}>{props.children}</swiper-slide>
	);
};

export const Swiper = {
	Container,
	Slide,
};
