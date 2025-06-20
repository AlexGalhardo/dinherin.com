"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import {
	createExpense as createExpenseService,
	deleteExpense as deleteExpenseService,
	getExpensesByUser as getExpensesByUserService,
	updateExpense as updateExpenseService,
} from "@/lib/services/expense-service";

export type ExpenseInput = {
	title: string;
	amount: number;
	categoryId: string;
	date: Date;
};

export const getExpensesByUserCached = unstable_cache(
	async (userEmail: string) => {
		return await getExpensesByUserService(userEmail);
	},
	["expenses"],
	{
		tags: ["expenses"],
		revalidate: 300,
	},
);

export async function createExpenseAction(userEmail: string, expense: ExpenseInput) {
	try {
		const result = await createExpenseService(userEmail, expense);
		revalidateTag("expenses");
		return { success: true, data: result };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function updateExpenseAction(expenseId: string, userEmail: string, expense: ExpenseInput) {
	try {
		const result = await updateExpenseService(expenseId, userEmail, expense);
		revalidateTag("expenses");
		return { success: true, data: result };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
	}
}

export async function deleteExpenseAction(expenseId: string, userEmail: string) {
	try {
		await deleteExpenseService(expenseId, userEmail);
		revalidateTag("expenses");
		return { success: true };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
	}
}
