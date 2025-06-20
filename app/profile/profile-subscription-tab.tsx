"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubscription } from "@/hooks/use-subscription";
import { ChevronRight } from "lucide-react";

export function ProfileSubscriptionTab() {
	const { session, handleCheckout, handleBillingPortal, isProcessingCheckout, isProcessingBillingPortal } =
		useSubscription();

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US").format(date);
	};

	return (
		<Card>
			<CardContent className="space-y-6 mt-3">
				<div className="space-y-4">
					<div className="space-y-1">
						<label className="text font-medium text-black dark:text-white">Current Plan</label>
						<input
							type="text"
							disabled
							value={
								session?.user?.stripe_testing_subscription
									? "7-day Trial"
									: session?.user?.stripe_subscription_start_at
										? "Premium Account"
										: "Free Account"
							}
							className="dark:text-white w-full px-3 py-2 rounded-md border border-input bg-muted text-black text-1xl"
						/>
					</div>

					{(session?.user?.stripe_testing_subscription || session?.user?.stripe_subscription_start_at) && (
						<div className="space-y-1">
							<label className="text font-medium text-black dark:text-white">Period</label>
							<input
								type="text"
								disabled
								value={
									session?.user?.stripe_testing_subscription
										? `${formatDate(session.user.stripe_testing_start_at as string)} - ${formatDate(
												session.user.stripe_testing_end_at as string,
											)}`
										: `${formatDate(session.user.stripe_subscription_start_at as string)} - ${formatDate(
												session.user.stripe_subscription_end_at as string,
											)}`
								}
								className="dark:text-white w-full px-3 py-2 rounded-md border border-input bg-muted text-black text-1xl"
							/>
						</div>
					)}

					{session?.user?.stripe_some_subscription_active && (
						<div className="space-y-1">
							<label className="text font-medium text-black dark:text-white">Next</label>
							<input
								type="text"
								disabled
								value={
									session?.user?.stripe_testing_subscription
										? `${formatDate(session.user.stripe_testing_end_at as string)} — ${
												session.user.stripe_subscription_cancel_at
													? "subscription will be canceled"
													: "you will be charged"
											}`
										: `${formatDate(session.user.stripe_subscription_end_at as string)} — ${
												session.user.stripe_subscription_cancel_at
													? "subscription will be canceled"
													: "you will be charged"
											}`
								}
								className="dark:text-white w-full px-3 py-2 rounded-md border border-input bg-muted text-black text-1xl"
							/>
						</div>
					)}

					{!session?.user?.stripe_some_subscription_active ? (
						<Button
							className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold"
							onClick={() => handleCheckout()}
							disabled={isProcessingCheckout}
						>
							{isProcessingCheckout ? "Processing..." : "Subscribe to Dinherin Premium"}
							<ChevronRight className="ml-2 h-5 w-5" />
						</Button>
					) : (
						<Button
							onClick={() => handleBillingPortal()}
							className="w-full bg-orange-500 hover:bg-orange-600 text-white"
							variant="default"
							disabled={isProcessingBillingPortal}
						>
							{isProcessingBillingPortal ? "Redirecting to Billing Portal..." : "Manage Subscription"}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
