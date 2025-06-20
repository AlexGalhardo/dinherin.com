import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

export async function GET(request: NextRequest, { params }: { params: Promise<{ category: string }> }) {
	try {
		const apiKey = request.headers.get("API_KEY");

		if (!apiKey) {
			return NextResponse.json({ error: "API_KEY header is required" }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: {
				api_key: apiKey,
			},
			select: {
				id: true,
				email: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
		}

		const { category } = await params;

		if (!category) {
			return NextResponse.json({ error: "Category is required" }, { status: 400 });
		}

		const expenses = await prisma.expense.findMany({
			where: {
				user_email: user.email,
				category_id: category,
			},
			orderBy: {
				date: "desc",
			},
		});

		return NextResponse.json(
			{
				success: true,
				expenses: expenses,
				category: category,
				total: expenses.length,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching expenses by category:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 },
		);
	}
}
