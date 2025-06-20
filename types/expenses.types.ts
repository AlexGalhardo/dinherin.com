export type ExpenseType = {
	id: string;
	title: string;
	amount: number;
	categoryId?: string;
	categoryName?: string;
	categoryIcon?: string;
	categoryColor?: string;
	userEmail: string;
	date: Date;
	createdAt?: Date;
	updatedAt?: Date;
};

export type CategoryType = {
	id: string;
	name: string;
	icon: string;
	color: string;
};

export type ExpenseFormDataType = {
	title: string;
	amount: string;
	categoryId: string;
	date: Date;
};

export type DateRangeType = {
	from?: Date;
	to?: Date;
};

export interface ExpenseRequestInterface {
	title: string;
	amount: number;
	date: string;
	category_id: string;
}
