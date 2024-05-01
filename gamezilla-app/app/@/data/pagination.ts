export type Pagination = {
	limit: number;
	offset: number;
};

export type WithPagination = {
	pagination: Pagination;
};

export type Paginated<T> = Pagination & {
	items: T[];
	total: number;
};
