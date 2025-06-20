import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

interface ExpenseUpdateRequest {
	title?: string;
	amount?: number;
	date?: string;
	category_id?: string;
	category_name?: string;
	category_icon?: string;
	category_color?: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

		const { id: expenseId } = await params;

		if (!expenseId) {
			return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
		}

		const expense = await prisma.expense.findUnique({
			where: {
				id: expenseId,
			},
		});

		if (!expense) {
			return NextResponse.json({ error: "Expense not found" }, { status: 404 });
		}

		if (expense.user_email !== user.email) {
			return NextResponse.json({ error: "Unauthorized to access this expense" }, { status: 403 });
		}

		return NextResponse.json(
			{
				success: true,
				expense: expense,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error fetching expense:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

		const { id: expenseId } = await params;

		if (!expenseId) {
			return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
		}

		const existingExpense = await prisma.expense.findUnique({
			where: {
				id: expenseId,
			},
		});

		if (!existingExpense) {
			return NextResponse.json({ error: "Expense not found" }, { status: 404 });
		}

		if (existingExpense.user_email !== user.email) {
			return NextResponse.json({ error: "Unauthorized to update this expense" }, { status: 403 });
		}

		const body: ExpenseUpdateRequest = await request.json();

		const updateData: any = {};

		if (body.title !== undefined) {
			updateData.title = body.title.trim();
		}

		if (body.amount !== undefined) {
			if (typeof body.amount !== "number" || body.amount <= 0) {
				return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
			}
			updateData.amount = body.amount;
		}

		if (body.date !== undefined) {
			try {
				const expenseDate = new Date(body.date);
				if (isNaN(expenseDate.getTime())) {
					throw new Error("Invalid date");
				}
				updateData.date = expenseDate;
			} catch (error) {
				return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
			}
		}

		if (body.category_id !== undefined) {
			updateData.category_id = body.category_id.trim();
		}

		const updatedExpense = await prisma.expense.update({
			where: {
				id: expenseId,
			},
			data: updateData,
		});

		return NextResponse.json(
			{
				success: true,
				message: "Expense updated successfully",
				expense: updatedExpense,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating expense:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

		const { id: expenseId } = await params;

		if (!expenseId) {
			return NextResponse.json({ error: "Expense ID is required" }, { status: 400 });
		}

		const expense = await prisma.expense.findUnique({
			where: {
				id: expenseId,
			},
		});

		if (!expense) {
			return NextResponse.json({ error: "Expense not found" }, { status: 404 });
		}

		if (expense.user_email !== user.email) {
			return NextResponse.json({ error: "Unauthorized to delete this expense" }, { status: 403 });
		}

		await prisma.expense.delete({
			where: {
				id: expenseId,
			},
		});

		return NextResponse.json(
			{
				success: true,
				message: "Expense deleted successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error deleting expense:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 },
		);
	}
}
