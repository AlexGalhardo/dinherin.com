import { CategoryType } from "@/types/expenses.types";

export const CATEGORIES: CategoryType[] = [
	{ id: "food", name: "Food", icon: "Utensils", color: "bg-red-500" },
	{ id: "subscriptions", name: "Subscriptions", icon: "CreditCard", color: "bg-blue-500" },
	{ id: "physical_shopping", name: "Physical Shopping", icon: "ShoppingBag", color: "bg-green-500" },
	{ id: "digital_shopping", name: "Digital Shopping", icon: "Briefcase", color: "bg-purple-500" },
	{ id: "entertainment", name: "Entertainment", icon: "Tv", color: "bg-yellow-500" },
	{ id: "education", name: "Education", icon: "BookOpen", color: "bg-indigo-500" },
	{ id: "transport", name: "Transport", icon: "Car", color: "bg-orange-500" },
	{ id: "supermarket", name: "Supermarket", icon: "ShoppingCart", color: "bg-teal-500" },
	{ id: "services", name: "Services", icon: "Scissors", color: "bg-pink-500" },
	{ id: "gifts", name: "Gifts", icon: "Gift", color: "bg-amber-500" },
	{ id: "health", name: "Health", icon: "Heart", color: "bg-rose-500" },
];

export const COLOR_MAP = {
	"bg-red-500": "#ef4444",
	"bg-blue-500": "#3b82f6",
	"bg-green-500": "#22c55e",
	"bg-purple-500": "#a855f7",
	"bg-yellow-500": "#eab308",
	"bg-indigo-500": "#6366f1",
	"bg-orange-500": "#f97316",
	"bg-teal-500": "#14b8a6",
	"bg-pink-500": "#ec4899",
	"bg-amber-500": "#f59e0b",
	"bg-rose-500": "#f43f5f",
};
