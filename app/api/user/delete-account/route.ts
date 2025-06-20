import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma-client";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email || !session.user.id) {
			return NextResponse.json({ error: "Not authorized" }, { status: 401 });
		}

		const deletedEmail = `deleted_${Date.now()}_${session.user.email}`;

		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				deleted_at: new Date(),
				email: deletedEmail,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: "Error to update password" }, { status: 500 });
	}
}
