"use client";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CATEGORIES, COLOR_MAP } from "@/lib/constants";
import { formatter } from "@/lib/utils/currency.util";
import { formatMonthFull } from "@/lib/utils/date.util";
import { renderIcon } from "@/lib/utils/icons.util";
import { ExpenseFormDataType, ExpenseType } from "@/types/expenses.types";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar, Loader2, AlertCircle, Trash2, Edit3, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback, useMemo, useEffect } from "react";
import type React from "react";

interface ExpenseModalsProps {
	isAddModalOpen: boolean;
	setIsAddModalOpen: (open: boolean) => void;
	newExpense: ExpenseFormDataType;
	setNewExpense: (expense: ExpenseFormDataType) => void;
	onAddExpense: () => Promise<void>;
	isEditModalOpen: boolean;
	setIsEditModalOpen: (open: boolean) => void;
	onEditExpense: () => Promise<void>;
	isDeleteModalOpen: boolean;
	setIsDeleteModalOpen: (open: boolean) => void;
	currentExpense: ExpenseType | null;
	onDeleteExpense: () => Promise<void>;
	isLoading?: {
		add: boolean;
		edit: boolean;
		delete: boolean;
	};
}

interface FormErrors {
	title?: string;
	amount?: string;
	categoryId?: string;
	date?: string;
}

export default function AppModals({
	isAddModalOpen,
	setIsAddModalOpen,
	newExpense,
	setNewExpense,
	onAddExpense,
	isEditModalOpen,
	setIsEditModalOpen,
	onEditExpense,
	isDeleteModalOpen,
	setIsDeleteModalOpen,
	currentExpense,
	onDeleteExpense,
	isLoading = { add: false, edit: false, delete: false },
}: ExpenseModalsProps) {
	const { toast } = useToast();
	const [errors, setErrors] = useState<FormErrors>({});
	const [displayValue, setDisplayValue] = useState("");

	const validateForm = useCallback((): boolean => {
		const newErrors: FormErrors = {};

		if (!newExpense.title.trim()) {
			newErrors.title = "Description is required";
		} else if (newExpense.title.trim().length < 3) {
			newErrors.title = "Description must be at least 3 characters";
		}

		if (!newExpense.amount || newExpense.amount === "0" || newExpense.amount === "") {
			newErrors.amount = "Amount is required";
		}

		if (!newExpense.categoryId) {
			newErrors.categoryId = "Category is required";
		}

		if (!newExpense.date) {
			newErrors.date = "Date is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [newExpense]);

	const clearErrors = useCallback(() => {
		setErrors({});
	}, []);

	const formatCurrency = useCallback((value: string): string => {
		const numbers = value.replace(/\D/g, "");
		if (!numbers) return "";
		const amount = parseInt(numbers, 10) / 100;
		return amount.toLocaleString("pt-BR", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	}, []);

	useEffect(() => {
		if (isEditModalOpen && currentExpense) {
			const amountCents = currentExpense.amount;
			if (amountCents !== undefined && amountCents !== null) {
				const amount = amountCents / 100;
				setDisplayValue(
					amount.toLocaleString("pt-BR", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					}),
				);
				setNewExpense({
					amount: amountCents.toString(),
					title: currentExpense.title,
					categoryId: currentExpense.categoryId ?? "",
					date: currentExpense.date,
				});
			}
		}
	}, [isEditModalOpen, currentExpense, setNewExpense]);

	const parseCurrency = useCallback((value: string): string => {
		const numbers = value.replace(/\D/g, "");
		if (!numbers) return "0";
		return numbers;
	}, []);

	const handleAmountChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value;
			const formatted = formatCurrency(inputValue);
			setDisplayValue(formatted);
			const amountInCents = parseCurrency(inputValue);
			setNewExpense({ ...newExpense, amount: amountInCents });

			if (errors.amount) {
				setErrors((prev) => ({ ...prev, amount: undefined }));
			}
		},
		[newExpense, setNewExpense, errors.amount, formatCurrency, parseCurrency],
	);

	const handleTitleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setNewExpense({ ...newExpense, title: e.target.value.toUpperCase() });
			if (errors.title) {
				setErrors((prev) => ({ ...prev, title: undefined }));
			}
		},
		[newExpense, setNewExpense, errors.title],
	);

	const handleCategoryChange = useCallback(
		(value: string) => {
			setNewExpense({ ...newExpense, categoryId: value });
			if (errors.categoryId) {
				setErrors((prev) => ({ ...prev, categoryId: undefined }));
			}
		},
		[newExpense, setNewExpense, errors.categoryId],
	);

	const handleDateChange = useCallback(
		(date: Date | undefined) => {
			if (date) {
				setNewExpense({ ...newExpense, date });
				if (errors.date) {
					setErrors((prev) => ({ ...prev, date: undefined }));
				}
			}
		},
		[newExpense, setNewExpense, errors.date],
	);

	useMemo(() => {
		if (newExpense.amount && newExpense.amount !== "0") {
			const cents = parseInt(newExpense.amount, 10);
			if (!isNaN(cents)) {
				const amount = cents / 100;
				setDisplayValue(
					amount.toLocaleString("pt-BR", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					}),
				);
			}
		} else {
			setDisplayValue("");
		}
	}, [newExpense.amount]);

	const handleAddExpense = useCallback(async () => {
		if (!validateForm()) {
			toast({
				title: "Validation error",
				description: "Please correct the errors in the form",
				variant: "error",
			});
			return;
		}

		try {
			await onAddExpense();
			clearErrors();
			setDisplayValue("");
		} catch (error) {
			console.error("Error adding expense:", error);
		}
	}, [validateForm, onAddExpense, clearErrors, toast]);

	const handleEditExpense = useCallback(async () => {
		if (!validateForm()) {
			toast({
				title: "Validation error",
				description: "Please correct the errors in the form",
				variant: "error",
			});
		}

		try {
			await onEditExpense();
			clearErrors();
			toast({
				title: "Expense edited successfully!",
				variant: "success",
			});
		} catch (error) {
			toast({
				title: "Error to update expense",
				description: "Try again later",
				variant: "error",
			});
		}
	}, [validateForm, onEditExpense, clearErrors, toast]);

	const handleDeleteExpense = useCallback(async () => {
		try {
			await onDeleteExpense();
		} catch (error) {
			console.error("Error deleting expense:", error);
		}
	}, [onDeleteExpense]);

	const selectedCategory = useMemo(() => {
		return CATEGORIES.find((c) => c.id === currentExpense?.categoryId);
	}, [currentExpense?.categoryId]);

	return (
		<>
			<Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Plus className="h-5 w-5 text-green-600" />
							Add New Expense
						</DialogTitle>
						<DialogDescription>Fill in the details for the new expense</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="description" className="text-sm font-medium">
								Description *
							</Label>
							<Input
								id="description"
								placeholder="e.g., Lunch at restaurant"
								value={newExpense.title.toUpperCase()}
								onChange={handleTitleChange}
								className={errors.title ? "border-red-500" : ""}
								disabled={isLoading.add}
							/>
							{errors.title && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">{errors.title}</AlertDescription>
								</Alert>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="amount" className="text-sm font-medium">
								Amount *
							</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
									$
								</span>
								<Input
									id="amount"
									className={`pl-10 ${errors.amount ? "border-red-500" : ""}`}
									placeholder="0.00"
									inputMode="numeric"
									value={displayValue}
									onChange={handleAmountChange}
									disabled={isLoading.add}
								/>
							</div>
							{errors.amount && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">{errors.amount}</AlertDescription>
								</Alert>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="category" className="text-sm font-medium">
								Category *
							</Label>
							<Select
								value={newExpense.categoryId}
								onValueChange={handleCategoryChange}
								disabled={isLoading.add}
							>
								<SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											<div className="flex items-center gap-2">
												<div
													className="h-3 w-3 rounded-full"
													style={{
														backgroundColor:
															COLOR_MAP[category.color as keyof typeof COLOR_MAP],
													}}
												/>
												<span>{category.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.categoryId && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">{errors.categoryId}</AlertDescription>
								</Alert>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="date" className="text-sm font-medium">
								Date *
							</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={`w-full justify-start text-left font-normal ${errors.date ? "border-red-500" : ""}`}
										disabled={isLoading.add}
									>
										<Calendar className="mr-2 h-4 w-4" />
										{newExpense.date
											? format(newExpense.date, "P", { locale: enUS })
											: "Select date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<CalendarComponent
										mode="single"
										selected={newExpense.date}
										onSelect={handleDateChange}
										initialFocus
										locale={enUS}
									/>
								</PopoverContent>
							</Popover>
							{errors.date && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">{errors.date}</AlertDescription>
								</Alert>
							)}
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isLoading.add}>
							Cancel
						</Button>
						<Button
							onClick={handleAddExpense}
							disabled={isLoading.add}
							className="bg-green-500 hover:bg-green-800 text-white"
						>
							{isLoading.add ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Adding...
								</>
							) : (
								<>
									<Plus className="mr-2 h-4 w-4" />
									Add Expense
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Edit3 className="h-5 w-5 text-orange-600" />
							Edit Expense
						</DialogTitle>
						<DialogDescription>Modify the expense details</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-description" className="text-sm font-medium">
								Description *
							</Label>
							<Input
								id="edit-description"
								placeholder="e.g., Lunch at restaurant"
								value={newExpense.title.toUpperCase()}
								onChange={handleTitleChange}
								className={errors.title ? "border-red-500" : ""}
								disabled={isLoading.edit}
							/>
							{errors.title && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">{errors.title}</AlertDescription>
								</Alert>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="edit-amount" className="text-sm font-medium">
								Amount *
							</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
									$
								</span>
								<Input
									id="edit-amount"
									className={`pl-10 ${errors.amount ? "border-red-500" : ""}`}
									placeholder="0.00"
									inputMode="numeric"
									value={displayValue}
									onChange={handleAmountChange}
									disabled={isLoading.edit}
								/>
							</div>
							{errors.amount && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">{errors.amount}</AlertDescription>
								</Alert>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="edit-category" className="text-sm font-medium">
								Category *
							</Label>
							<Select
								value={newExpense.categoryId}
								onValueChange={handleCategoryChange}
								disabled={isLoading.edit}
							>
								<SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											<div className="flex items-center gap-2">
												<div
													className="h-3 w-3 rounded-full"
													style={{
														backgroundColor:
															COLOR_MAP[category.color as keyof typeof COLOR_MAP],
													}}
												/>
												<span>{category.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.categoryId && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">{errors.categoryId}</AlertDescription>
								</Alert>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="edit-date" className="text-sm font-medium">
								Date *
							</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={`w-full justify-start text-left font-normal ${errors.date ? "border-red-500" : ""}`}
										disabled={isLoading.edit}
									>
										<Calendar className="mr-2 h-4 w-4" />
										{newExpense.date
											? format(newExpense.date, "P", { locale: enUS })
											: "Select date"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<CalendarComponent
										mode="single"
										selected={newExpense.date}
										onSelect={handleDateChange}
										locale={enUS}
									/>
								</PopoverContent>
							</Popover>
							{errors.date && (
								<Alert variant="destructive" className="py-2">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-sm">{errors.date}</AlertDescription>
								</Alert>
							)}
						</div>
					</div>

					<DialogFooter className="gap-2">
						<Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isLoading.edit}>
							Cancel
						</Button>
						<Button
							onClick={handleEditExpense}
							disabled={isLoading.edit}
							className="bg-orange-600 hover:bg-orange-700 text-white"
						>
							{isLoading.edit ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Edit3 className="mr-2 h-4 w-4" />
									Save Changes
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<Trash2 className="h-5 w-5" />
							Confirm Deletion
						</DialogTitle>
						<DialogDescription>
							This action cannot be undone. The expense will be permanently removed.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						{currentExpense && (
							<div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
								<div className="flex items-center gap-3">
									<div
										className="h-12 w-12 rounded-full flex items-center justify-center text-white"
										style={{
											backgroundColor:
												COLOR_MAP[selectedCategory?.color as keyof typeof COLOR_MAP],
										}}
									>
										{selectedCategory?.icon && renderIcon(selectedCategory.icon, "h-6 w-6")}
									</div>
									<div>
										<p className="font-semibold text-lg">{currentExpense.title}</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{formatMonthFull(currentExpense.date)}
										</p>
										<p className="text-xs text-gray-500">{selectedCategory?.name}</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-bold text-xl text-red-600">
										- {formatter.format(currentExpense.amount / 100)}
									</p>
								</div>
							</div>
						)}
					</div>

					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={() => setIsDeleteModalOpen(false)}
							disabled={isLoading.delete}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteExpense} disabled={isLoading.delete}>
							{isLoading.delete ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete Expense
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
