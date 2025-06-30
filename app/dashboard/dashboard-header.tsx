"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { DollarSign, LogOut, Moon, PlusCircle, Sun, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AppHeaderProps {
	onAddExpense: () => void;
}

export default function AppHeader({ onAddExpense }: AppHeaderProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const isMobile = useIsMobile();

	const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "";

	return (
		<header className="sticky top-0 z-10 bg-white dark:bg-black shadow-sm">
			<div className="container mx-auto px-4 py-4 flex justify-between items-center">
				<Link href="/dashboard">
					{isMobile ? (
						<DollarSign className="h-6 w-6 text-green-600" />
					) : (
						<h1 className="font-bold text-lg text-green-600 dark:text-white">
							<span className="bg-clip-text">D I N H E R I N</span>
						</h1>
					)}
				</Link>
				<div className="flex gap-2">
					{!isMobile && (
						<Button
							variant="outline"
							size="icon"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						>
							{theme === "dark" ? (
								<Sun className="h-[1.2rem] w-[1.2rem]" />
							) : (
								<Moon className="h-[1.2rem] w-[1.2rem]" />
							)}
						</Button>
					)}
					<Button onClick={onAddExpense} className="bg-rose-500 hover:bg-rose-800 text-white">
						<PlusCircle className="mr-2 h-4 w-4" />
						{isMobile ? "Expense" : "Add Expense"}
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="gap-2">
								<User className="h-4 w-4" />
								{isMobile ? firstName : session?.user?.name}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => router.push("/profile")}>
								<User className="mr-2 h-4 w-4" />
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
								<LogOut className="mr-2 h-4 w-4" />
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
