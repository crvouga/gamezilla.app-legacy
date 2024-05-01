import type { ICodeGenerator } from "./code-generator";
import { CodeGeneratorFake } from "./code-generator-impl-fake";
import { CodeGeneratorReal } from "./code-generator-impl-real";

export type Impl =
	| {
			t: "real";
	  }
	| {
			t: "fake";
			code: string;
	  };

export const CodeGenerator = (impl: Impl): ICodeGenerator => {
	switch (impl.t) {
		case "real": {
			return CodeGeneratorReal();
		}

		case "fake": {
			return CodeGeneratorFake(impl);
		}
	}
};
