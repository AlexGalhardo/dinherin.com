"use server";

import { prisma } from "@/prisma/prisma-client";
import { v4 as uuidv4 } from "uuid";
import { revalidateTag, unstable_cache } from "next/cache";

export type ExpenseInput = {
	title: string;
	amount: number;
	categoryId: string;
	date: Date;
};

export type ExpenseInterface = {
	id: string;
	title: string;
	amount: number;
	date: Date;
	categoryId: string;
	userEmail: string;
	createdAt: Date;
	updatedAt: Date | null;
};

const CACHE_TAGS = {
	EXPENSE: "expense",
	EXPENSES: "expenses",
} as const;

const CACHE_REVALIDATE_TIME = 300;

export const getExpensesByUserCached = unstable_cache(
	async (userEmail: string): Promise<ExpenseInterface[]> => {
		try {
			const expenses = await prisma.expense.findMany({
				where: { user_email: userEmail },
				orderBy: { created_at: "desc" },
			});

			return expenses.map((expense) => ({
				id: expense.id,
				title: expense.title,
				amount: expense.amount,
				date: expense.date,
				categoryId: expense.category_id,
				userEmail: expense.user_email,
				createdAt: expense.created_at,
				updatedAt: expense.updated_at,
			}));
		} catch (error: any) {
			console.error("Error fetching expenses by user:", error);
			throw new Error("Failed to fetch expenses: " + error?.message);
		}
	},
	["expenses-by-user"],
	{
		tags: [CACHE_TAGS.EXPENSES],
		revalidate: CACHE_REVALIDATE_TIME,
	},
);

export async function getExpensesByUser(userEmail: string): Promise<ExpenseInterface[]> {
	try {
		const expenses = await prisma.expense.findMany({
			where: { user_email: userEmail },
			orderBy: { created_at: "desc" },
		});

		return expenses.map((expense) => ({
			id: expense.id,
			title: expense.title,
			amount: expense.amount,
			date: expense.date,
			categoryId: expense.category_id,
			userEmail: expense.user_email,
			createdAt: expense.created_at,
			updatedAt: expense.updated_at,
		}));
	} catch (error: any) {
		console.error("Error fetching expenses by user:", error);
		throw new Error("Failed to fetch expenses: " + error?.message);
	}
}

export async function createExpense(userEmail: string, expense: ExpenseInput): Promise<ExpenseInterface> {
	try {
		const newExpense = await prisma.expense.create({
			data: {
				id: uuidv4(),
				title: expense.title,
				amount: expense.amount,
				date: expense.date,
				category_id: expense.categoryId,
				user_email: userEmail,
			},
		});

		revalidateTag(CACHE_TAGS.EXPENSE);
		revalidateTag(CACHE_TAGS.EXPENSES);

		return {
			id: newExpense.id,
			title: newExpense.title,
			amount: newExpense.amount,
			date: newExpense.date,
			categoryId: newExpense.category_id,
			userEmail: newExpense.user_email,
			createdAt: newExpense.created_at,
			updatedAt: newExpense.updated_at,
		};
	} catch (error: any) {
		console.error("Error creating expense:", error);
		throw new Error("Failed to create expense: " + error?.message);
	}
}

export async function updateExpense(id: string, userEmail: string, expense: ExpenseInput): Promise<ExpenseInterface> {
	try {
		const updatedExpense = await prisma.expense.update({
			where: {
				id,
				user_email: userEmail,
			},
			data: {
				title: expense.title,
				amount: expense.amount,
				date: expense.date,
				category_id: expense.categoryId,
				updated_at: new Date(),
			},
		});

		revalidateTag(CACHE_TAGS.EXPENSE);
		revalidateTag(CACHE_TAGS.EXPENSES);

		return {
			id: updatedExpense.id,
			title: updatedExpense.title,
			amount: updatedExpense.amount,
			date: updatedExpense.date,
			categoryId: updatedExpense.category_id,
			userEmail: updatedExpense.user_email,
			createdAt: updatedExpense.created_at,
			updatedAt: updatedExpense.updated_at,
		};
	} catch (error: any) {
		console.error("Error updating expense:", error);
		throw new Error("Failed to update expense: " + error?.message);
	}
}

export async function deleteExpense(id: string, userEmail: string): Promise<{ success: boolean }> {
	try {
		await prisma.expense.delete({
			where: {
				id,
				user_email: userEmail,
			},
		});

		revalidateTag(CACHE_TAGS.EXPENSE);
		revalidateTag(CACHE_TAGS.EXPENSES);

		return { success: true };
	} catch (error: any) {
		console.error("Error deleting expense:", error);
		throw new Error("Failed to delete expense: " + error?.message);
	}
}

export async function getExpenseById(id: string, userEmail: string): Promise<ExpenseInterface | null> {
	try {
		const expense = await prisma.expense.findFirst({
			where: {
				id,
				user_email: userEmail,
			},
		});

		if (!expense) return null;

		return {
			id: expense.id,
			title: expense.title,
			amount: expense.amount,
			date: expense.date,
			categoryId: expense.category_id,
			userEmail: expense.user_email,
			createdAt: expense.created_at,
			updatedAt: expense.updated_at,
		};
	} catch (error: any) {
		console.error("Error fetching expense by id:", error);
		throw new Error("Failed to fetch expense: " + error?.message);
	}
}

export async function getExpensesByDateRange(
	userEmail: string,
	startDate: Date,
	endDate: Date,
): Promise<ExpenseInterface[]> {
	try {
		const expenses = await prisma.expense.findMany({
			where: {
				user_email: userEmail,
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			orderBy: { date: "desc" },
		});

		return expenses.map((expense) => ({
			id: expense.id,
			title: expense.title,
			amount: expense.amount,
			date: expense.date,
			categoryId: expense.category_id,
			userEmail: expense.user_email,
			createdAt: expense.created_at,
			updatedAt: expense.updated_at,
		}));
	} catch (error: any) {
		console.error("Error fetching expenses by date range:", error);
		throw new Error("Failed to fetch expenses by date range: " + error?.message);
	}
}

export async function getExpensesByCategory(userEmail: string, categoryId: string): Promise<ExpenseInterface[]> {
	try {
		const expenses = await prisma.expense.findMany({
			where: {
				user_email: userEmail,
				category_id: categoryId,
			},
			orderBy: { created_at: "desc" },
		});

		return expenses.map((expense) => ({
			id: expense.id,
			title: expense.title,
			amount: expense.amount,
			date: expense.date,
			categoryId: expense.category_id,
			userEmail: expense.user_email,
			createdAt: expense.created_at,
			updatedAt: expense.updated_at,
		}));
	} catch (error: any) {
		console.error("Error fetching expenses by category:", error);
		throw new Error("Failed to fetch expenses by category: " + error?.message);
	}
}

export async function getTotalExpensesByUser(userEmail: string): Promise<number> {
	try {
		const result = await prisma.expense.aggregate({
			where: { user_email: userEmail },
			_sum: { amount: true },
		});

		return result._sum.amount || 0;
	} catch (error: any) {
		console.error("Error calculating total expenses:", error);
		throw new Error("Failed to calculate total expenses: " + error?.message);
	}
}
