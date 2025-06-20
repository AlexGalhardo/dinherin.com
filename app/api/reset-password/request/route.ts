import { ResetPasswordEmail } from "@/emails/reset-password-email";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/prisma/prisma-client";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	try {
		const { email } = await request.json();

		if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
			return NextResponse.json({ error: "Email inválido" }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, name: true, email: true },
		});

		if (!user) return NextResponse.json({ success: true });

		const token = uuidv4().replace(/-/g, "");
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1);

		await prisma.user.update({
			where: { email: user.email },
			data: {
				reset_password_token: token,
				reset_password_token_expires_at: expiresAt,
				updated_at: new Date(),
			},
		});

		const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

		await resend.emails.send({
			from: "onboarding@resend.dev",
			to: [user.email],
			subject: "Reset Your Password - Dinherin.com",
			react: ResetPasswordEmail({ name: user.name, resetLink }),
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json({ error: "Erro ao processar solicitação de recuperação de senha" }, { status: 500 });
	}
}
