"use client";

import { PieChart } from "@/components/pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES, COLOR_MAP } from "@/lib/constants";
import { formatter } from "@/lib/utils/currency.util";
import { renderIcon } from "@/lib/utils/icons.util";
import { ExpenseType } from "@/types/expenses.types";

interface AppStatisticsProps {
	expenses: ExpenseType[];
}

export default function AppStatistics({ expenses }: AppStatisticsProps) {
	const totalByCategory = CATEGORIES.map((category) => {
		const total = expenses
			.filter((expense) => expense.categoryId === category.id)
			.reduce((sum, expense) => sum + expense.amount, 0);

		return {
			...category,
			total,
		};
	});

	const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

	const pieChartData = totalByCategory
		.filter((cat) => cat.total > 0)
		.map((category) => ({
			id: category.id,
			name: category.name,
			value: category.total,
			color: category.color,
			percentage: ((category.total / totalExpenses) * 100).toFixed(1),
		}));

	return (
		<div className="lg:col-span-1 space-y-6">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg font-medium">Total Expenses</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold text-rose-600">
						{formatter.format(totalExpenses / 100).replace("US$", "R$")}
					</div>
					<p className="text-sm text-slate-500 mt-1">{expenses.length} transactions</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-lg font-medium">Expenses by Category</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center mb-4">
						<PieChart data={pieChartData} size={180} />
					</div>

					<div className="divide-y">
						{totalByCategory
							.filter((cat) => cat.total > 0)
							.sort((a, b) => b.total - a.total)
							.map((category) => {
								const percentage = ((category.total / totalExpenses) * 100).toFixed(1);
								const categoryColor = COLOR_MAP[category.color as keyof typeof COLOR_MAP];

								return (
									<div key={category.id} className="flex items-center justify-between py-3">
										<div className="flex items-center">
											<div
												className="h-8 w-8 rounded-full flex items-center justify-center mr-3"
												style={{ backgroundColor: categoryColor }}
											>
												<div className="text-white">{renderIcon(category.icon, "h-4 w-4")}</div>
											</div>
											<div>
												<p className="font-medium">{category.name}</p>
												<p className="text-sm text-slate-500">{percentage}%</p>
											</div>
										</div>
										<p className="font-medium">
											{formatter.format(category.total / 100).replace("US$", "$")}
										</p>
									</div>
								);
							})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
