export const Box = (input: {children: React.ReactNode; className?: string}) => {
	return <div className={input.className}>{input.children}</div>;
};
