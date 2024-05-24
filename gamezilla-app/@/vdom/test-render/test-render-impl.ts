import { ITestRender } from "./test-render";
import { TestRenderReact } from "./test-render-impl-react";

export type Impl = {
	t: "react";
};

export const TestRender = async (impl: Impl): Promise<ITestRender> => {
	switch (impl.t) {
		case "react": {
			return TestRenderReact;
		}
	}
};
