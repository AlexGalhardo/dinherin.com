import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/prisma/prisma-client";

export async function POST(request: Request) {
	try {
		const { token, password } = await request.json();

		if (!token || token.length !== 32) {
			return NextResponse.json({ error: "Token inválido" }, { status: 400 });
		}

		const user = await prisma.user.findFirst({
			where: {
				reset_password_token: token,
				reset_password_token_expires_at: {
					gt: new Date(),
				},
			},
			select: {
				email: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await prisma.user.update({
			where: { email: user.email },
			data: {
				password: hashedPassword,
				reset_password_token: null,
				reset_password_token_expires_at: null,
				updated_at: new Date(),
			},
		});

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 });
	}
}
