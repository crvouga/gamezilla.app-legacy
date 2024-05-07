import { waitForElementById } from "gamezilla-app/@/core/dom";
import type { VDomChildren } from "gamezilla-app/@/vdom";
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
	let previousActiveIndex = swiperElement.swiper?.activeIndex ?? 0;
	const onSlideChangeEventHandler = (event: Event) => {
		// @ts-expect-error
		const swiper = event?.detail?.[0];
		const activeIndex = swiper?.activeIndex ?? 0;
		if (activeIndex !== previousActiveIndex) {
			props.onSlideIndexChanged(activeIndex);
			previousActiveIndex = activeIndex;
		}
	};

	swiperElement.addEventListener(
		"swiperslidechange",
		onSlideChangeEventHandler,
	);

	const observer = new MutationObserver((mutations) => {
		for (let i = 0; i < mutations.length; i++) {
			const mutation = mutations[i]!;
			for (let j = 0; j < mutation.removedNodes.length; j++) {
				const node = mutation.removedNodes[j]!;
				if (node.contains(swiperElement)) {
					mountedElementIds.delete(props.id);
					observer.disconnect();
					swiperElement.removeEventListener(
						"swiperslidechange",
						onSlideChangeEventHandler,
					);
					swiperElement.remove();
				}
			}
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });
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
