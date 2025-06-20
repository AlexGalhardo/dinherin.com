import { prisma } from "@/prisma/prisma-client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const sessionId = req.headers.get("sessionId");

		if (!sessionId) {
			return NextResponse.json({ error: "sessionId not sent" }, { status: 400 });
		}

		const user = await prisma.user.findFirst({
			where: { stripe_checkout_session_id: sessionId },
			select: { email: true, password: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			email: user.email,
			password: user.password,
		});
	} catch (error) {
		return NextResponse.json({ error: "ERROR getting customer name and email" }, { status: 500 });
	}
}
