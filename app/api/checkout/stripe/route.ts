import { prisma } from "@/prisma/prisma-client";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET_KEY =
	process.env.NODE_ENV === "production" ? process.env.STRIPE_SECRET_KEY_LIVE : process.env.STRIPE_SECRET_KEY_TEST;

const STRIPE_PRICE_ID =
	process.env.NODE_ENV === "production"
		? process.env.STRIPE_CHECKOUT_PRICE_ID_PROD
		: process.env.STRIPE_CHECKOUT_PRICE_ID_DEV;

export const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
	apiVersion: "2025-05-28.basil",
});

export async function GET(request: NextRequest) {
	try {
		if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID) {
			return NextResponse.json({ error: "Stripe configuration not found" }, { status: 500 });
		}

		const stripe_testing_subscription_finished = request.headers.get(
			"stripe_testing_subscription_finished",
		) as string;
		const name = request.headers.get("name") as string;
		const email = request.headers.get("email") as string;
		const stripeCustomerId = request.headers.get("stripe_customer_id") as string;

		let customer = null;

		if (stripe_testing_subscription_finished === "false") {
			customer = await stripe.customers.create({
				email,
				name,
			});

			await prisma.user.upsert({
				where: { email },
				update: {
					name,
					stripe_customer_id: customer.id,
					stripe_testing_subscription_finished: false,
				},
				create: {
					email,
					name,
					stripe_customer_id: customer.id,
					stripe_testing_subscription_finished: false,
				},
			});

			const session = await stripe.checkout.sessions.create({
				mode: "subscription",
				customer: customer.id,
				line_items: [
					{
						price: STRIPE_PRICE_ID,
						quantity: 1,
					},
				],
				subscription_data: {
					trial_period_days: 7,
				},
				locale: "en",
				success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app`,
				cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
			});

			await prisma.user.update({
				where: { email },
				data: {
					stripe_checkout_session_id: session.id,
				},
			});

			await prisma.user.update({
				where: { email },
				data: {
					stripe_checkout_session_id: session.id,
				},
			});

			return NextResponse.json({ stripe_checkout_url: session.url });
		} else {
			if (stripeCustomerId) {
				customer = await stripe.customers.retrieve(stripeCustomerId);
			} else {
				const existingUser = await prisma.user.findUnique({
					where: { email },
				});

				if (existingUser?.stripe_customer_id) {
					customer = await stripe.customers.retrieve(existingUser.stripe_customer_id);
				} else {
					customer = await stripe.customers.create({
						email,
						name,
					});

					await prisma.user.upsert({
						where: { email },
						update: {
							name,
							stripe_customer_id: customer.id,
							stripe_testing_subscription_finished: true,
						},
						create: {
							email,
							name,
							stripe_customer_id: customer.id,
							stripe_testing_subscription_finished: true,
						},
					});
				}
			}

			const session = await stripe.checkout.sessions.create({
				mode: "subscription",
				customer: customer.id,
				line_items: [
					{
						price: STRIPE_PRICE_ID,
						quantity: 1,
					},
				],
				locale: "en",
				success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app`,
				cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
			});

			return NextResponse.json({ stripe_checkout_url: session.url });
		}
	} catch (error: any) {
		console.log(`Error creating stripe checkout session: ${error?.message}`);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
