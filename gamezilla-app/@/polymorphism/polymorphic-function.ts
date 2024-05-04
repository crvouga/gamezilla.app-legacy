export const Polymorphic = <
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	TFunction extends (variant: any, ...args: any[]) => any | (() => void),
>() => {
	type Variant = Parameters<TFunction>[0];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	type RestParameters = Parameters<TFunction> extends [any, ...infer Rest]
		? Rest
		: never;
	type TOutput = ReturnType<TFunction>;

	type Implementation<
		TVariant extends Variant,
		TImplOutput extends TOutput | Variant,
	> = {
		predicate: (variant: Variant) => variant is TVariant;
		implementation: (variant: TVariant, ...args: RestParameters) => TImplOutput;
	};

	let handleNotImplemented: TFunction | undefined;

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const implementations: Implementation<any, any>[] = [];

	function run(variant: Variant, ...args: RestParameters): TOutput {
		for (const implementation of implementations) {
			if (implementation.predicate(variant)) {
				return implementation.implementation(variant, ...args) as TOutput;
			}
		}

		if (!handleNotImplemented) {
			throw new Error("No implementation for variant");
		}

		const handled = handleNotImplemented(variant, ...args);

		return handled;
	}

	run.implement = <
		TVariant extends Variant,
		TImplOutput extends TOutput | Variant,
	>(
		predicate: (variant: Variant) => variant is TVariant,
		implementation: (variant: TVariant, ...args: RestParameters) => TImplOutput,
	) => {
		implementations.push({ predicate, implementation });
	};

	run.implementDefault = (implementation: TFunction) => {
		handleNotImplemented = implementation;
	};

	return run;
};
