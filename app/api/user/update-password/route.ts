import { authOptions } from "@/lib/auth";
import { prisma } from "@/prisma/prisma-client";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const passwordSchema = z.object({
	newPassword: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one number")
		.regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Password must contain at least one special character"),
});

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user || !session.user.email) {
			return NextResponse.json({ error: "Not authorized" }, { status: 401 });
		}

		const body = await req.json();

		const validationResult = passwordSchema.safeParse(body);

		if (!validationResult.success) {
			const errors = validationResult.error.errors.map((err) => ({
				field: err.path.join("."),
				message: err.message,
			}));

			return NextResponse.json(
				{
					error: "Password validation failed",
					details: errors,
					message: errors[0]?.message || "Invalid password format",
				},
				{ status: 400 },
			);
		}

		const { newPassword } = validationResult.data;

		const existingUser = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true, email: true },
		});

		if (!existingUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const hashedPassword = await hash(newPassword, 12);

		await prisma.user.update({
			where: { email: session.user.email },
			data: {
				password: hashedPassword,
				updated_at: new Date(),
			},
		});

		return NextResponse.json({
			success: true,
			message: "Password updated successfully",
		});
	} catch (error) {
		console.error("Error updating password:", error);
		if (error instanceof Error) {
			if (error.message.includes("connect")) {
				return NextResponse.json({ error: "Database connection error" }, { status: 503 });
			}

			if (error.message.includes("Prisma")) {
				return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
			}
		}

		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
