import { type NextRequest, NextResponse } from "next/server";
import { stripe } from "../../webhook/stripe/checkout/route";

export async function GET(req: NextRequest) {
	try {
		const stripeCustomerId = req.headers.get("stripe_customer_id") as string;

		const sessionBillingPortal = await stripe.billingPortal.sessions.create({
			customer: stripeCustomerId as string,
			return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
			locale: "en",
		});

		return NextResponse.json({
			success: true,
			stripe_billing_portal_session_url: sessionBillingPortal.url,
		});
	} catch (error) {
		return NextResponse.json({ error: "ERROR getting customer name and email" }, { status: 500 });
	}
}
