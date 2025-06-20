import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";
import { ExpenseRequestInterface } from "@/types/expenses.types";

export async function POST(request: NextRequest) {
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
				name: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
		}

		const body: ExpenseRequestInterface = await request.json();

		if (!body.title || !body.amount || !body.date || !body.category_id) {
			return NextResponse.json(
				{
					error: "Missing required fields",
					required: ["title", "amount", "date", "category_id"],
				},
				{ status: 400 },
			);
		}

		if (typeof body.amount !== "number" || body.amount <= 0) {
			return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
		}

		let expenseDate: Date;
		try {
			expenseDate = new Date(body.date);
			if (isNaN(expenseDate.getTime())) {
				throw new Error("Invalid date");
			}
		} catch (error) {
			return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
		}

		const expense = await prisma.expense.create({
			data: {
				title: body.title.trim(),
				amount: body.amount,
				date: expenseDate,
				category_id: body.category_id.trim(),
				user_email: user.email,
			},
		});

		return NextResponse.json(
			{
				success: true,
				message: "Expense created successfully",
				expense: {
					id: expense.id,
					title: expense.title,
					amount: expense.amount,
					date: expense.date,
					category_id: expense.category_id,
					created_at: expense.created_at,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof Error) {
			if (error.message.includes("Foreign key constraint")) {
				return NextResponse.json({ error: "Invalid user reference" }, { status: 400 });
			}
		}

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
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

		const expenses = await prisma.expense.findMany({
			where: {
				user_email: user.email,
			},
			orderBy: {
				date: "desc",
			},
		});

		return NextResponse.json(
			{
				success: true,
				expenses: expenses,
				total: expenses.length,
			},
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 },
		);
	}
}
