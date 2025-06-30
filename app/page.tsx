"use client";

import type React from "react";
import { useEffect } from "react";
import Footer from "@/components/footer";
import LoadingScreen from "@/components/loading-screen";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	BarChart2,
	Check,
	ChevronRight,
	CloudDownload,
	FileSpreadsheet,
	LogOut,
	PieChart,
	Search,
	User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LandingPageClient(): React.ReactElement {
	const router = useRouter();
	const { data: session, status } = useSession();
	const { toast } = useToast();

	const handleSubscriptionCheckout = async () => {
		try {
			if (!session?.user) {
				router.push("/signup?trial=true");
				return;
			}

			const res = await fetch("/api/checkout/stripe", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					stripe_testing_subscription_finished: session.user.stripe_testing_subscription_finished
						? "true"
						: "false",
					name: session.user.name as string,
					email: session.user.email as string,
				},
			});

			if (!res.ok) {
				throw new Error("Error processing checkout");
			}

			const data = await res.json();

			if (data.stripe_checkout_url) {
				window.location.href = data.stripe_checkout_url;
			} else {
				throw new Error("Checkout URL not found");
			}
		} catch (error) {
			console.error("Checkout error:", error);
			toast({
				title: "Checkout error",
				description: "Unable to process checkout. Please try again.",
				variant: "error",
			});
		}
	};

	useEffect(() => {
		if (status === "authenticated") {
			router.push("/dashboard");
		}
	}, [status, router]);

	if (status === "loading") return <LoadingScreen />;

	return (
		<div className="min-h-screen bg-black text-white flex flex-col">
			<header className="sticky top-0 z-50 border-b border-gray-800 bg-black backdrop-blur-sm">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center">
						<h1 className="text-xl font-bold text-green-600 dark:text-white tracking-wider uppercase">
							D I N H E R I N
						</h1>
					</div>
					<div className="flex gap-4">
						{session ? (
							<div className="flex items-center gap-2">
								<Link href="/dashboard">
									<Button variant="outline" className="gap-2 border-gray-700 hover:bg-gray-800">
										Dashboard
									</Button>
								</Link>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" className="gap-2 border-gray-700 hover:bg-gray-800">
											<User className="h-4 w-4" />
											{session?.user?.name?.split(" ")[0]}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
										<DropdownMenuItem
											onClick={() => router.push("/profile")}
											className="hover:bg-gray-800"
										>
											<User className="mr-2 h-4 w-4" />
											Profile
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => signOut({ callbackUrl: "/login" })}
											className="hover:bg-gray-800"
										>
											<LogOut className="mr-2 h-4 w-4" />
											Sign Out
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						) : (
							<Link href="/login">
								<Button className="bg-white hover:bg-orange-500 font-bold text-black transition-colors dark:hover:bg-orange-600 hover:text-white">
									Login
								</Button>
							</Link>
						)}
					</div>
				</div>
			</header>

			<main className="flex-1">
				<section className="py-20 px-4 mb-6">
					<div className="container mx-auto">
						<div className="flex flex-col lg:flex-row gap-12 items-center">
							<div className="lg:w-1/2">
								<h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
									Manage your personal finances with ease
								</h1>
								<p className="text-xl text-gray-400 mb-8 leading-relaxed">
									Track your expenses, visualize statistics and make smart financial decisions with
									our simple and intuitive platform.
								</p>

								<Button
									className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-6 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
									onClick={handleSubscriptionCheckout}
								>
									<span className="hidden md:inline">Try free for 7 days</span>
									<span className="inline md:hidden">7-day trial</span>
									<ChevronRight className="ml-2 h-5 w-5" />
								</Button>
							</div>

							<div className="lg:w-1/2">
								<div className="rounded-lg overflow-hidden shadow-2xl">
									<img
										src="/assets/landing-page.gif"
										alt="Personal finance system dashboard"
										width={600}
										height={450}
										className="w-full h-auto"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="py-20 px-4 bg-gray-950">
					<div className="container mx-auto">
						<h2 className="text-center text-3xl md:text-4xl font-bold mb-16 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
							Everything you need to manage your finances
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							<div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
								<div className="bg-blue-500/20 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
									<PieChart className="h-6 w-6 text-blue-500" />
								</div>
								<h3 className="text-xl font-semibold mb-3">Expense Overview</h3>
								<p className="text-gray-400 leading-relaxed">
									Visualize your expenses by category with intuitive and easy-to-understand charts.
								</p>
							</div>

							<div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
								<div className="bg-green-500/20 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
									<BarChart2 className="h-6 w-6 text-green-500" />
								</div>
								<h3 className="text-xl font-semibold mb-3">Detailed Statistics</h3>
								<p className="text-gray-400 leading-relaxed">
									Access deep insights about your spending habits and financial patterns.
								</p>
							</div>

							<div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
								<div className="bg-purple-500/20 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
									<Search className="h-6 w-6 text-purple-500" />
								</div>
								<h3 className="text-xl font-semibold mb-3">Advanced Filters</h3>
								<p className="text-gray-400 leading-relaxed">
									Search and filter your transactions by title, category and time period.
								</p>
							</div>

							<div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
								<div className="bg-amber-500/20 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
									<FileSpreadsheet className="h-6 w-6 text-amber-500" />
								</div>
								<h3 className="text-xl font-semibold mb-3">Export to Excel and CSV</h3>
								<p className="text-gray-400 leading-relaxed">
									Export your transactions and history to Excel and CSV spreadsheets.
								</p>
							</div>

							<div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
								<div className="bg-red-500/20 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
									<CloudDownload className="h-6 w-6 text-red-500" />
								</div>
								<h3 className="text-xl font-semibold mb-3">API Access</h3>
								<p className="text-gray-400 leading-relaxed">
									Full API access to manage all your expenses programmatically.
								</p>
							</div>

							<div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
								<div className="bg-blue-500/20 w-12 h-12 flex items-center justify-center rounded-lg mb-4">
									<Check className="h-6 w-6 text-blue-500" />
								</div>
								<h3 className="text-xl font-semibold mb-3">Savings Tips</h3>
								<p className="text-gray-400 leading-relaxed">
									Receive personalized insights and tips to save more based on your spending.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="py-20 px-4 bg-black">
					<div className="container mx-auto max-w-4xl">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
								Frequently Asked Questions
							</h2>
							<p className="text-xl text-gray-400">
								Answers to the most common questions from our customers
							</p>
						</div>

						<Accordion type="single" collapsible className="space-y-4">
							<AccordionItem value="item-1" className="border border-gray-800 rounded-lg px-6">
								<AccordionTrigger className="text-lg hover:text-green-400 transition-colors">
									How does the app help me save money?
								</AccordionTrigger>
								<AccordionContent className="text-gray-400 leading-relaxed">
									Our app allows you to clearly see your spending patterns, identify areas where
									you're overspending and set savings goals. Having a clear view of your finances, you
									can make more informed decisions and reduce unnecessary expenses.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="item-2" className="border border-gray-800 rounded-lg px-6">
								<AccordionTrigger className="text-lg hover:text-green-400 transition-colors">
									Is my financial data secure?
								</AccordionTrigger>
								<AccordionContent className="text-gray-400 leading-relaxed">
									Yes, the security of your data is our top priority. We use end-to-end encryption and
									follow the strictest industry security standards. Your financial data is never
									shared with third parties without your explicit consent.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="item-3" className="border border-gray-800 rounded-lg px-6">
								<AccordionTrigger className="text-lg hover:text-green-400 transition-colors">
									Can I cancel my subscription at any time?
								</AccordionTrigger>
								<AccordionContent className="text-gray-400 leading-relaxed">
									Absolutely. You can cancel your subscription at any time without fees or penalties.
									After cancellation, you will continue to have access to the service until the end of
									the paid period.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="item-4" className="border border-gray-800 rounded-lg px-6">
								<AccordionTrigger className="text-lg hover:text-green-400 transition-colors">
									Does the app work on all devices?
								</AccordionTrigger>
								<AccordionContent className="text-gray-400 leading-relaxed">
									Yes, our app is fully responsive and works on any device with internet access,
									including smartphones, tablets and computers. Your data is automatically synced
									across all your devices.
								</AccordionContent>
							</AccordionItem>

							<AccordionItem value="item-5" className="border border-gray-800 rounded-lg px-6">
								<AccordionTrigger className="text-lg hover:text-green-400 transition-colors">
									Do I need financial knowledge to use it?
								</AccordionTrigger>
								<AccordionContent className="text-gray-400 leading-relaxed">
									No, our app was designed to be intuitive and easy to use, regardless of your level
									of financial knowledge. The user-friendly interface and visual charts make it simple
									to understand your finances.
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</section>
			</main>

			<div className="bg-black">
				<Footer />
			</div>
		</div>
	);
}
