import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import Stripe from "stripe";

const stripe = new Stripe(
	process.env.ENVIRONMENT === "production"
		? process.env.STRIPE_SECRET_KEY_LIVE!
		: process.env.STRIPE_SECRET_KEY_TEST!,
	{
		apiVersion: "2025-05-28.basil",
	},
);

async function verifyUsersSubscriptionActive(): Promise<number> {
	try {
		const users = await prisma.user.findMany({
			where: {
				stripe_customer_id: {
					not: null,
				},
				stripe_some_subscription_active: true,
			},
			select: {
				id: true,
				email: true,
				stripe_customer_id: true,
			},
		});

		let updatedCount = 0;

		for (const user of users) {
			if (!user.stripe_customer_id) continue;

			try {
				const subscriptions = await stripe.subscriptions.list({
					customer: user.stripe_customer_id,
					status: "active",
					limit: 100,
				});

				const hasActiveSubscription = subscriptions.data.length > 0;

				if (!hasActiveSubscription) {
					await prisma.user.update({
						where: {
							id: user.id,
						},
						data: {
							stripe_some_subscription_active: false,
							updated_at: new Date(),
						},
					});

					updatedCount++;
					console.log(`Updated user ${user.email} - no active subscriptions found`);
				}
			} catch (stripeError) {
				console.error(`Error checking Stripe subscription for user ${user.email}:`, stripeError);
				continue;
			}
		}

		return updatedCount;
	} catch (error) {
		return 0;
	}
}

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");
		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const updatedUsersCount = await verifyUsersSubscriptionActive();

		return NextResponse.json({
			success: true,
			message: "Subscription verification completed",
			updatedUsers: updatedUsersCount,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
}
