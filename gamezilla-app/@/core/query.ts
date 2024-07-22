export type QueryWhere<TRow> = [
	"and" | "or",
	(
		| ["=" | ">=" | "<=" | "not" | "in", keyof TRow, string | number]
		| QueryWhere<TRow>
	)[],
];

export type Query<TRow> = {
	limit: number;
	offset: number;
	order: [keyof TRow, "asc" | "desc"][];
	where: QueryWhere<TRow>;
};

type Row = {
	userId: string;
	puzzleId: string;
	createdAt: number;
	lastUpdatedAt: number;
	deletedAt: number | null;
};

export const query: Query<Row> = {
	limit: 10,
	offset: 0,
	order: [["createdAt", "asc"]],
	where: [
		"and",
		[
			["=", "userId", "1234"],
            ["=", "puzzleId", "5678"],
            ['or', [['>=', 'createdAt', 123]]]
		],
	],
};
