import {
	createExpenseAction,
	deleteExpenseAction,
	ExpenseInput,
	getExpensesByUserCached,
	updateExpenseAction,
} from "@/lib/actions/expenses-actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";

export function useExpenses(userEmail: string | null | undefined) {
	return useQuery({
		queryKey: ["expenses", userEmail],
		queryFn: () => getExpensesByUserCached(userEmail!),
		enabled: !!userEmail,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useCreateExpense() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userEmail, expense }: { userEmail: string; expense: ExpenseInput }) =>
			createExpenseAction(userEmail, expense),
		onSuccess: (result, variables) => {
			if (result.success) {
				queryClient.invalidateQueries({ queryKey: ["expenses", variables.userEmail] });
				toast({
					title: "Expense Created!",
					variant: "success",
				});
			} else {
				toast({
					title: "Expense error!",
					variant: "error",
				});
			}
		},
		onError: () => {
			toast({
				title: "Expense error!",
				variant: "error",
			});
		},
	});
}

export function useUpdateExpense() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			expenseId,
			userEmail,
			expense,
		}: { expenseId: string; userEmail: string; expense: ExpenseInput }) =>
			updateExpenseAction(expenseId, userEmail, expense),
		onSuccess: (result, variables) => {
			if (result.success) {
				queryClient.invalidateQueries({ queryKey: ["expenses", variables.userEmail] });
			} else {
				toast({
					title: result.error || "Error to UPDATE expense. Try again.",
					variant: "error",
				});
			}
		},
		onError: () => {
			toast({
				title: "Error to UPDATE expense. Try again.",
				variant: "error",
			});
		},
	});
}

export function useDeleteExpense() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ expenseId, userEmail }: { expenseId: string; userEmail: string }) =>
			deleteExpenseAction(expenseId, userEmail),
		onSuccess: (result, variables) => {
			if (result.success) {
				queryClient.invalidateQueries({ queryKey: ["expenses", variables.userEmail] });
				toast({
					title: "Expense deleted successfully!",
					variant: "success",
				});
			} else {
				toast({
					title: result.error || "Error to DELETE expense. Try again.",
					variant: "error",
				});
			}
		},
		onError: () => {
			toast({
				title: "Error to DELETE expense. Try again.",
				variant: "error",
			});
		},
	});
}
