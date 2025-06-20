"use client";

import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export function useSubscription() {
	const { data: session } = useSession();
	const { toast } = useToast();

	const checkoutMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/checkout/stripe", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					stripe_testing_subscription_finished: session?.user?.stripe_testing_subscription_finished
						? "true"
						: "false",
					name: session?.user?.name as string,
					email: session?.user?.email as string,
					stripe_customer_id: session?.user?.stripe_customer_id as string,
				},
			});

			if (!response.ok) {
				throw new Error("Error creating checkout session");
			}

			return await response.json();
		},
		onSuccess: (data) => {
			window.location.href = data.stripe_checkout_url;
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Something went wrong. Try again later.",
				variant: "error",
			});
		},
	});

	const billingPortalMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/user/stripe-billing-portal-session", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					stripe_customer_id: session?.user?.stripe_customer_id as string,
				},
			});

			if (!response.ok) {
				throw new Error("Error creating billing portal session");
			}

			return response.json();
		},
		onSuccess: (data) => {
			window.location.href = data.stripe_billing_portal_session_url;
		},
		onError: () => {
			toast({
				title: "Error",
				description: "Something went wrong. Try again later.",
				variant: "error",
			});
		},
	});

	return {
		session,
		handleCheckout: checkoutMutation.mutate,
		handleBillingPortal: billingPortalMutation.mutate,
		isProcessingCheckout: checkoutMutation.isPending,
		isProcessingBillingPortal: billingPortalMutation.isPending,
	};
}
