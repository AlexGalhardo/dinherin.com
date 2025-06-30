"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { CATEGORIES, COLOR_MAP } from "@/lib/constants";
import { exportToCSV, exportToExcel } from "@/lib/utils/export-files";
import { formatter } from "@/lib/utils/currency.util";
import { formatMonthFull } from "@/lib/utils/date.util";
import { renderIcon } from "@/lib/utils/icons.util";
import { ExpenseType } from "@/types/expenses.types";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface ExpenseListProps {
	expenses: ExpenseType[];
	onEditExpense: (expense: ExpenseType) => void;
	onDeleteExpense: (expense: ExpenseType) => void;
}

export default function AppList({ expenses, onEditExpense, onDeleteExpense }: ExpenseListProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 15;
	const isMobile = useIsMobile();

	const totalPages = Math.ceil(expenses.length / itemsPerPage);
	const paginatedExpenses = expenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const handleExportToExcel = () => {
		const data = expenses.map((expense) => {
			const category = CATEGORIES.find((c) => c.id === expense.categoryId);
			return {
				category: category?.name ?? expense.categoryName,
				title: expense.title,
				amount: formatter.format(expense.amount / 100),
				date: format(expense.date, "dd/MM/yyyy"),
			};
		});

		exportToExcel(data, "EXCEL-Expenses-Dinherin");
		toast({
			title: "File Excel exported successfully!",
			variant: "success",
		});
	};

	const handleExportToCSV = () => {
		const data = expenses.map((expense) => {
			const category = CATEGORIES.find((c) => c.id === expense.categoryId);
			return {
				category: category?.name ?? expense.categoryName,
				title: expense.title,
				amount: expense.amount.toString().replace(".", ","),
				date: format(expense.date, "dd/MM/yyyy"),
			};
		});

		exportToCSV(data, "CSV-Expenses-Dinherin");
		toast({
			title: "File CSV exported successfully!",
			variant: "success",
		});
	};

	const Pagination = () => {
		if (totalPages <= 1) return null;

		return (
			<div className="flex items-center justify-center gap-2 py-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<span className="text-sm">
					Page {currentPage} from {totalPages}
				</span>
				<Button
					variant="outline"
					size="icon"
					onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
					disabled={currentPage === totalPages}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		);
	};

	return (
		<div className="lg:col-span-2">
			<Card>
				<CardHeader className="pb-2">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg font-medium">Transactions</CardTitle>
						<div className="flex space-x-2">
							<Button
								title="Export to Excel"
								variant="outline"
								size="icon"
								onClick={handleExportToExcel}
								className="bg-blue-300"
							>
								<FileSpreadsheet className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								title="Export to CSV"
								onClick={handleExportToCSV}
								className="bg-yellow-300"
							>
								<FileText className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{paginatedExpenses.length > 0 ? (
						<div className="divide-y">
							<div className="py-3 px-6 bg-white dark:bg-black">
								<div className="flex justify-between items-center">
									<p className="text-sm text-slate-900 dark:text-white">
										{expenses.length > 1
											? `${expenses.length} transactions found`
											: "1 transaction found"}
									</p>
									<p className="text-sm text-slate-900 dark:text-white">
										Total:{" "}
										{formatter
											.format(expenses.reduce((sum, expense) => sum + expense.amount, 0) / 100)
											.replace("US", "")}
									</p>
								</div>
							</div>

							{totalPages > 1 && <Pagination />}

							{paginatedExpenses.map((expense) => {
								const category = CATEGORIES.find((c) => c.id === expense.categoryId);
								const categoryColor = category
									? COLOR_MAP[category.color as keyof typeof COLOR_MAP]
									: "#6b7280";

								return (
									<div key={expense.id} className="flex items-center justify-between py-4 px-6">
										<div className="flex items-center">
											{!isMobile && (
												<div
													className="h-10 w-10 rounded-full flex items-center justify-center mr-4"
													style={{ backgroundColor: categoryColor }}
												>
													{category?.icon && (
														<div className="text-white">
															{renderIcon(category.icon, "h-5 w-5")}
														</div>
													)}
												</div>
											)}
											<div>
												<p className={!isMobile ? "font-medium" : "text-sm"}>
													{expense.title.toUpperCase()}
												</p>
												<p className="text-sm text-slate-500">
													{formatMonthFull(expense.date)}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-3">
											<p
												className={
													!isMobile
														? "font-medium text-rose-600"
														: "text-sm font-normal text-rose-600"
												}
											>
												- {formatter.format(expense.amount / 100).replace("US", "")}
											</p>

											<Button
												variant="ghost"
												size="icon"
												onClick={() => onEditExpense(expense)}
												className="border-[1px] border-orange-500 rounded-s-sm hover:bg-orange-600 group"
											>
												<Pencil className="h-4 w-4 text-orange-500 group-hover:text-white" />
											</Button>

											<Button
												variant="ghost"
												size="icon"
												onClick={() => onDeleteExpense(expense)}
												className="border-[1px] border-rose-500 rounded-s-sm hover:bg-rose-600 group"
											>
												<Trash2 className="h-4 w-4 text-rose-500 group-hover:text-white" />
											</Button>
										</div>
									</div>
								);
							})}

							{totalPages > 1 && <Pagination />}
						</div>
					) : (
						<div className="py-12 text-center">
							<p className="text-slate-500">No transactions found</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
