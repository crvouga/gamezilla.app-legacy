import { Inferno } from "inferno";
import { VDOM_IMPL_CURRENT } from "public-config";
import { VDomImpl } from "./vdom-impl";

export type StylesObjectKehab = Inferno.HTMLAttributes<HTMLDivElement>["style"];
export type StylesObjectCamel = React.CSSProperties;
export type StylesObject = StylesObjectKehab | StylesObjectCamel;

export const camelStringToKehabString = (camelString: string): string => {
	return camelString.replace(/([A-Z])/g, "-$1").toLowerCase();
};

export const kehabStringToCamelString = (kehabString: string): string => {
	return kehabString.replace(/-([a-z])/g, (g) => g[1]!.toUpperCase());
};

const kehabObjectToCamelObject = (
	kehabObject: StylesObjectKehab,
): StylesObjectCamel => {
	const camelObject: StylesObjectCamel = {};

	if (typeof kehabObject !== "object") {
		return camelObject;
	}

	for (const kehabKey in kehabObject) {
		const kehabValue =
			// @ts-ignore
			kehabObject[kehabKey];
		const camelKey = kehabStringToCamelString(kehabKey);
		// @ts-ignore
		camelObject[camelKey] = kehabValue;
	}

	return camelObject;
};

export const styles = (
	stylesObject: StylesObjectKehab,
	vdomImpl: VDomImpl = VDOM_IMPL_CURRENT,
): Record<string, unknown> => {
	switch (vdomImpl) {
		case "inferno":
		case "preact":
		case "solid": {
			return stylesObject as Record<string, unknown>;
		}
		case "react-with-compiler":
		case "react": {
			return kehabObjectToCamelObject(stylesObject) as Record<string, unknown>;
		}
	}
};
