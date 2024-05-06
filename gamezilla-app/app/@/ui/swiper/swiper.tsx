import { waitForElementById } from "gamezilla-app/@/core/dom";
import { VDomChildren } from "gamezilla-app/@/vdom";
import { register } from "swiper/element/bundle";

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
const mountedElementIds = new Set<string>();

const onContainer = async (props: {
	id: string;
	onSlideIndexChanged: (index: number) => void;
}) => {
	if (mountedElementIds.has(props.id)) {
		return;
	}

	const swiperElement = await waitForElementById(props.id);

	if (!swiperElement) {
		return;
	}

	mountedElementIds.add(props.id);

	// @ts-expect-error
	const activeIndex = swiperElement.swiper?.activeIndex ?? 0;
	let previousActiveIndex = activeIndex;
	const onSlideChangeEventHandler = (event: Event) => {
		// @ts-expect-error
		const swiper = event?.detail?.[0];
		const activeIndex = swiper?.activeIndex ?? 0;
		if (activeIndex === previousActiveIndex) {
			return;
		}
		props.onSlideIndexChanged(activeIndex);
		previousActiveIndex = activeIndex;
	};

	swiperElement.addEventListener(
		"swiperslidechange",
		onSlideChangeEventHandler,
	);

	let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

	const cleanup = () => {
		clearTimeout(timeout);
		swiperElement.removeEventListener(
			"swiperslidechange",
			onSlideChangeEventHandler,
		);
		mountedElementIds.delete(props.id);
		console.log("cleanup", props.id);
	};

	const TIMEOUT = 1000;
	const cleanUpGarbage = () => {
		const element = document.getElementById(props.id);
		if (!element) {
			cleanup();
			return;
		}
		timeout = setTimeout(cleanUpGarbage, TIMEOUT);
	};
	timeout = setTimeout(cleanUpGarbage, TIMEOUT);
};

const Container = (props: {
	id: string;
	onSlideIndexChanged: (index: number) => void;
	children?: VDomChildren;
	className?: string;
	slideIndex: number;
}) => {
	onContainer(props);
	return (
		<swiper-container
			id={props.id}
			slides-per-view="auto"
			className={props.className}
			grab-cursor
			centered-slides
			initial-slide={props.slideIndex}
			slide={props.slideIndex}
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
