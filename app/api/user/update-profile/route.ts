import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma-client";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const nameSchema = z
	.string()
	.min(4, "Name is required")
	.max(16, "Name must be at most 16 characters")
	.transform((name) =>
		name
			.trim()
			.split(" ")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
			.join(" "),
	);

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json({ error: "Not authorized" }, { status: 401 });
		}

		const body = await req.json();

		const validation = nameSchema.safeParse(body.name);

		if (!validation.success) {
			return NextResponse.json({ error: "Invalid name", details: validation.error.errors }, { status: 400 });
		}

		const formattedName = validation.data;

		await prisma.user.update({
			where: { email: session.user.email },
			data: {
				name: formattedName,
			},
		});

		return NextResponse.json({ success: true, name: formattedName });
	} catch (error) {
		console.error("Error updating profile: ", error);
		return NextResponse.json({ error: "Error updating profile" }, { status: 500 });
	}
}
