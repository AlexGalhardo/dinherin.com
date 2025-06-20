"use client";

import { useCreateExpense, useDeleteExpense, useExpenses, useUpdateExpense } from "@/hooks/use-expenses";
import { CATEGORIES } from "@/lib/constants";
import { currencyToNumber, formatter } from "@/lib/utils/currency.util";
import { DateRangeType, ExpenseFormDataType, ExpenseType } from "@/types/expenses.types";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import AppHeader from "./app-header";
import AppFilters from "./app-filters";
import AppStatistics from "./app-statistics";
import AppList from "./app-list";
import AppModals from "./app-modal";
import LoadingScreen from "@/components/loading-screen";
import { useSession } from "next-auth/react";

interface ProcessedExpense extends ExpenseType {
	date: Date;
	categoryName?: string;
}

export default function AppDashboard() {
	const { data: session, status, update } = useSession();
	const router = useRouter();
	const [hasUpdated, setHasUpdated] = useState(false);

	useEffect(() => {
		async function checkAuthAndUpdate() {
			if (status === "unauthenticated") {
				router.push("/login");
			} else if (status === "authenticated" && !hasUpdated) {
				if (!session?.user?.stripe_some_subscription_active) {
					await new Promise((resolve) => setTimeout(resolve, 10000));
				}
				await update();
				setHasUpdated(true);
			}
		}
		checkAuthAndUpdate();
	}, [status, router, update, hasUpdated]);

	const { user, isAuthenticated, isLoading: authLoading } = useAuth();

	useEffect(() => {
		if (user && process.env.NEXT_PUBLIC_TEST_MODE !== "true" && !user.stripe_some_subscription_active) {
			router.push("/profile?subscription_active=false");
		}
	}, [user, router]);

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [currentExpense, setCurrentExpense] = useState<ExpenseType | null>(null);

	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [dateRange, setDateRange] = useState<DateRangeType>({
		from: undefined,
		to: undefined,
	});

	const [newExpense, setNewExpense] = useState<ExpenseFormDataType>({
		title: "",
		amount: "",
		categoryId: "",
		date: new Date(),
	});

	const { data: expenses = [], isLoading: expensesLoading, error: expensesError } = useExpenses(user?.email);
	const createExpenseMutation = useCreateExpense();
	const updateExpenseMutation = useUpdateExpense();
	const deleteExpenseMutation = useDeleteExpense();

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, authLoading, router]);

	const processedExpenses = useMemo((): ProcessedExpense[] => {
		if (!expenses) return [];

		return expenses.map((expense) => {
			const category = CATEGORIES.find((c) => c.id === expense.categoryId);
			return {
				...expense,
				date: new Date(expense.date),
				categoryName: category?.name,
				updatedAt: expense.updatedAt ? new Date(expense.updatedAt) : undefined,
			};
		});
	}, [expenses]);

	const filteredExpenses = useMemo(() => {
		return processedExpenses.filter((expense) => {
			const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesCategory = categoryFilter === "all" || expense.categoryName === categoryFilter;

			let matchesDate = true;
			if (dateRange.from && dateRange.to) {
				matchesDate = expense.date >= dateRange.from && expense.date <= dateRange.to;
			} else if (dateRange.from) {
				matchesDate = expense.date >= dateRange.from;
			} else if (dateRange.to) {
				matchesDate = expense.date <= dateRange.to;
			}

			return matchesSearch && matchesCategory && matchesDate;
		});
	}, [processedExpenses, searchTerm, categoryFilter, dateRange]);

	const sortedExpenses = useMemo(() => {
		return [...filteredExpenses].sort((a, b) => b.date.getTime() - a.date.getTime());
	}, [filteredExpenses]);

	const resetForm = useCallback(() => {
		setNewExpense({
			title: "",
			amount: "",
			categoryId: "",
			date: new Date(),
		});
	}, []);

	const handleAddExpense = useCallback(async () => {
		if (!newExpense.title || !newExpense.amount || !newExpense.categoryId || !user?.email) {
			return;
		}

		try {
			const amount = currencyToNumber(newExpense.amount);
			const expenseInput = {
				title: newExpense.title.trim(),
				amount,
				categoryId: newExpense.categoryId,
				date: newExpense.date,
			};

			await createExpenseMutation.mutateAsync({
				userEmail: user.email,
				expense: expenseInput,
			});

			setIsAddModalOpen(false);
			resetForm();
		} catch (error) {
			console.error("Error adding expense:", error);
		}
	}, [newExpense, user?.email, createExpenseMutation, resetForm]);

	const handleEditExpense = useCallback(async () => {
		if (!currentExpense || !newExpense.title || !newExpense.amount || !newExpense.categoryId || !user?.email) {
			return;
		}

		try {
			const amount = currencyToNumber(newExpense.amount);
			const expenseInput = {
				title: newExpense.title.trim(),
				amount,
				categoryId: newExpense.categoryId,
				date: newExpense.date,
			};

			await updateExpenseMutation.mutateAsync({
				expenseId: currentExpense.id,
				userEmail: user.email,
				expense: expenseInput,
			});

			setIsEditModalOpen(false);
			setCurrentExpense(null);
			resetForm();
		} catch (error) {
			console.error("Error updating expense:", error);
		}
	}, [currentExpense, newExpense, user?.email, updateExpenseMutation, resetForm]);

	const handleDeleteExpense = useCallback(async () => {
		if (!currentExpense || !user?.email) return;

		try {
			await deleteExpenseMutation.mutateAsync({
				expenseId: currentExpense.id,
				userEmail: user.email,
			});

			setIsDeleteModalOpen(false);
			setCurrentExpense(null);
		} catch (error) {
			console.error("Error deleting expense:", error);
		}
	}, [currentExpense, user?.email, deleteExpenseMutation]);

	const openEditModal = useCallback((expense: ExpenseType) => {
		setCurrentExpense(expense);
		setNewExpense({
			title: expense.title,
			amount: formatter
				.format(expense.amount / 100)
				.replace("R$", "")
				.replace("US", "")
				.trim(),
			categoryId: expense.categoryId as string,
			date: new Date(expense.date),
		});
		setIsEditModalOpen(true);
	}, []);

	const openDeleteModal = useCallback((expense: ExpenseType) => {
		setCurrentExpense(expense);
		setIsDeleteModalOpen(true);
	}, []);

	const clearFilters = useCallback(() => {
		setSearchTerm("");
		setCategoryFilter("all");
		setDateRange({
			from: undefined,
			to: undefined,
		});
	}, []);

	if (authLoading || expensesLoading) return <LoadingScreen />;

	if (!isAuthenticated || !user) return null;

	if (expensesError) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
				<div className="text-center p-8">
					<h2 className="text-2xl font-bold text-red-600 mb-4">Error fetching expenses</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						Something went wrong while fetching your expenses. Please try again later.
					</p>
					<button
						onClick={() => window.location.reload()}
						className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
					>
						Try again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-black">
			<AppHeader onAddExpense={() => setIsAddModalOpen(true)} />

			<main className="container mx-auto px-4 py-6">
				<AppFilters
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					categoryFilter={categoryFilter}
					setCategoryFilter={setCategoryFilter}
					dateRange={dateRange}
					setDateRange={setDateRange}
					onClearFilters={clearFilters}
				/>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<AppStatistics expenses={processedExpenses} />
					<AppList
						expenses={sortedExpenses}
						onEditExpense={openEditModal}
						onDeleteExpense={openDeleteModal}
					/>
				</div>
			</main>

			<AppModals
				isAddModalOpen={isAddModalOpen}
				setIsAddModalOpen={setIsAddModalOpen}
				newExpense={newExpense}
				setNewExpense={setNewExpense}
				onAddExpense={handleAddExpense}
				isEditModalOpen={isEditModalOpen}
				setIsEditModalOpen={setIsEditModalOpen}
				onEditExpense={handleEditExpense}
				isDeleteModalOpen={isDeleteModalOpen}
				setIsDeleteModalOpen={setIsDeleteModalOpen}
				currentExpense={currentExpense}
				onDeleteExpense={handleDeleteExpense}
			/>
		</div>
	);
}
