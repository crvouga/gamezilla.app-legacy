import type { ICodeGenerator } from "./code-generator";

export const CodeGeneratorReal = (): ICodeGenerator => {
	return {
		generate() {
			const code = crypto
				.getRandomValues(new Uint32Array(1))[0]!
				.toString()
				.slice(0, 6);
			return code;
		},
	};
};
