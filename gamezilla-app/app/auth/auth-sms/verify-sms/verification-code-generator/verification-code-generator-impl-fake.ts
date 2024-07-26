import type {IVerificationCodeGenerator} from './verification-code-generator';

export const CodeGeneratorFake = ({
	code,
}: {
	code: string;
}): IVerificationCodeGenerator => {
	return {
		generate() {
			return code;
		},
	};
};
