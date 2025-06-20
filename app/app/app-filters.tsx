"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, COLOR_MAP } from "@/lib/constants";
import { DateRangeType } from "@/types/expenses.types";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar, Search, X } from "lucide-react";

interface AppFiltersProps {
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	categoryFilter: string;
	setCategoryFilter: (category: string) => void;
	dateRange: DateRangeType;
	setDateRange: (range: DateRangeType) => void;
	onClearFilters: () => void;
}

export default function AppFilters({
	searchTerm,
	setSearchTerm,
	categoryFilter,
	setCategoryFilter,
	dateRange,
	setDateRange,
	onClearFilters,
}: AppFiltersProps) {
	const hasActiveFilters = searchTerm || categoryFilter !== "all" || dateRange?.from || dateRange?.to;

	return (
		<div className="mb-6 bg-white dark:bg-black p-4 rounded-lg shadow-sm">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="col-span-1 md:col-span-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
						<Input
							placeholder="Search expenses..."
							className="pl-10"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
				</div>
				<div>
					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger>
							<SelectValue placeholder="Category" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							{CATEGORIES.map((category) => (
								<SelectItem key={category.id} value={category.id}>
									<div className="flex items-center gap-2">
										<div
											className="h-3 w-3 rounded-full"
											style={{
												backgroundColor: COLOR_MAP[category.color as keyof typeof COLOR_MAP],
											}}
										/>
										<span>{category.name}</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" className="w-full justify-start text-left font-normal">
								<Calendar className="mr-2 h-4 w-4" />
								{dateRange?.from ? (
									dateRange?.to ? (
										<>
											{format(dateRange.from, "P", { locale: pt })} -{" "}
											{format(dateRange.to, "P", { locale: pt })}
										</>
									) : (
										format(dateRange.from, "P", { locale: pt })
									)
								) : (
									"Choose Date"
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<CalendarComponent
								initialFocus
								mode="range"
								defaultMonth={dateRange?.from ?? new Date()}
								selected={dateRange as import("react-day-picker").DateRange | undefined}
								onSelect={(range) => {
									if (range) setDateRange(range);
								}}
								numberOfMonths={1}
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>
			{hasActiveFilters && (
				<div className="mt-4 flex items-center">
					<span className="text-sm text-slate-500 mr-2">Active filters:</span>
					{searchTerm && (
						<Badge variant="outline" className="mr-2">
							Search: {searchTerm}
							<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
						</Badge>
					)}
					{categoryFilter !== "all" && (
						<Badge variant="outline" className="mr-2">
							Category: {CATEGORIES.find((c) => c.id === categoryFilter)?.name}
							<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter("all")} />
						</Badge>
					)}
					{(dateRange.from || dateRange.to) && (
						<Badge variant="outline" className="mr-2">
							Date: {dateRange.from ? format(dateRange.from, "P", { locale: pt }) : ""}
							{dateRange.to ? ` - ${format(dateRange.to, "P", { locale: pt })}` : ""}
							<X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setDateRange({})} />
						</Badge>
					)}
					<Button variant="ghost" size="sm" onClick={onClearFilters}>
						Clean All Filters
					</Button>
				</div>
			)}
		</div>
	);
}
