import { p } from "gamezilla-app/@shared/core/parser";
import { IconXMark, Slider } from "gamezilla-app/app/@shared/ui";

export const Model = p.obj({
	t: p.l("flow-grid"),
	width: p.num,
	height: p.num,
});

export type Model = p.Infer<typeof Model>;

export const init = (model: { width: number; height: number }): Model => {
	return {
		t: "flow-grid",
		width: model.width,
		height: model.height,
	};
};

export const ViewForm = ({
	form,
	onInput,
}: {
	form: Model;
	onInput: (dimensions: Model) => void;
}) => {
	return (
		<>
			<div className="flex items-center justify-center gap-1 text-center text-5xl font-bold">
				<p>{`${form.width}w`}</p>

				<IconXMark className="h-6 w-6" />

				<p>{`${form.height}h`}</p>
			</div>

			<div className="flex flex-col gap-3 p-4 pb-8">
				<Slider
					onInput={(width) => onInput({ ...form, width })}
					value={form.width}
					label="Width"
					min={3}
					max={15}
					step={1}
				/>
				<Slider
					onInput={(height) => onInput({ ...form, height })}
					value={form.height}
					label="Height"
					min={3}
					max={15}
					step={1}
				/>
			</div>
		</>
	);
};
