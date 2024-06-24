export const Box = (props: {
	children: React.ReactNode;
	className?: string;
}) => {
	return <div className={props.className}>{props.children}</div>;
};
