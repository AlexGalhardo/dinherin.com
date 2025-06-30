import { prisma } from "@/prisma/prisma-client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const stripe = new Stripe(
	process.env.ENVIRONMENT === "production"
		? process.env.STRIPE_SECRET_KEY_LIVE!
		: (process.env.STRIPE_SECRET_KEY_TEST! as string),
	{
		apiVersion: "2025-05-28.basil",
	},
);

export async function POST(req: Request) {
	try {
		const payload = await req.json();

		if (payload.type === "checkout.session.completed") {
			await prisma.user.update({
				where: {
					email: payload.data?.object?.customer_details?.email,
				},
				data: {
					stripe_checkout_session_id: payload.data?.object?.id,
				},
			});
		}

		if (payload.type === "invoice.finalized") {
			if (payload.data?.object?.amount_paid === 4990 || payload.data?.object?.amount_paid > 0) {
				await prisma.user.update({
					where: {
						email: payload.data.object.customer_email,
					},
					data: {
						stripe_customer_id: payload.data.object.customer,
						stripe_some_subscription_active: true,
						stripe_testing_subscription_finished: true,
						stripe_testing_subscription: false,
						stripe_hosted_invoice_url: payload.data.object.hosted_invoice_url,
						stripe_invoice_pdf: payload.data.object.invoice_pdf,
						stripe_testing_start_at: null,
						stripe_testing_end_at: null,
						stripe_subscription_start_at: new Date(
							payload.data.object.lines.data[0].period.start * 1000,
						).toISOString(),
						stripe_subscription_end_at: new Date(
							payload.data.object.lines.data[0].period.end * 1000,
						).toISOString(),
						stripe_canceled_subscription: false,
						stripe_subscription_canceled_feedback: null,
						stripe_subscription_canceled_reason: null,
						stripe_subscription_canceled_comment: null,
						stripe_subscription_canceled_at: null,
						stripe_subscription_cancel_at: null,
					},
				});
			}
		}

		if (payload.type === "customer.subscription.updated") {
			await prisma.user.update({
				where: {
					stripe_customer_id: payload.data.object.customer,
				},
				data: {
					stripe_canceled_subscription: true,
					stripe_subscription_canceled_feedback: payload.data.object.cancellation_details?.feedback,
					stripe_subscription_canceled_reason: payload.data.object.cancellation_details?.reason,
					stripe_subscription_canceled_comment: payload.data.object.cancellation_details?.comment,
					stripe_subscription_canceled_at: payload.data.object.canceled_at
						? new Date(payload.data.object.canceled_at * 1000).toISOString()
						: null,
					stripe_subscription_cancel_at: payload.data.object.cancel_at
						? new Date(payload.data.object.cancel_at * 1000).toISOString()
						: null,
				},
			});
		}

		if (payload.type === "invoice.paid") {
			const sessionBillingPortal = await stripe.billingPortal.sessions.create({
				customer: payload.data.object.customer,
				return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
				locale: "en",
			});

			await prisma.user.update({
				where: {
					email: payload.data.object.customer_email,
				},
				data: {
					stripe_billing_portal_url: sessionBillingPortal?.url,
				},
			});

			if (payload.data?.object?.amount_paid === 0) {
				await prisma.user.update({
					where: {
						email: payload.data.object.customer_email,
					},
					data: {
						stripe_customer_id: payload.data.object.customer,
						stripe_some_subscription_active: true,
						stripe_testing_subscription_finished: false,
						stripe_testing_subscription: true,
						stripe_hosted_invoice_url: payload.data.object.hosted_invoice_url,
						stripe_invoice_pdf: payload.data.object.invoice_pdf,
						stripe_testing_start_at: new Date(
							payload.data.object.lines.data[0].period.start * 1000,
						).toISOString(),
						stripe_testing_end_at: new Date(
							payload.data.object.lines.data[0].period.end * 1000,
						).toISOString(),
					},
				});
			}

			await prisma.subscription.create({
				data: {
					customer_id: payload.data.object?.customer,
					customer_name: payload.data.object?.customer_name || "",
					customer_email: payload.data.object?.customer_email,
					complete_log: JSON.stringify(payload),
				},
			});
		}

		await prisma.webhookLogs.create({
			data: {
				json: JSON.stringify(payload),
			},
		});

		return NextResponse.json({ success: true, status: 200 });
	} catch (error) {
		return NextResponse.json({ success: false, status: 500, error: String(error) });
	}
}
