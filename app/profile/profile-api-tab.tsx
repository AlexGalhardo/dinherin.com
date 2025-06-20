"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CodeBlockComponent from "@/components/code-block-component";
import { useToast } from "@/hooks/use-toast";
import ClipboardJS from "clipboard";
import { useEffect } from "react";

interface ApiTabProps {
	apiKey?: string;
}

export function ProfileApiTab({ apiKey }: ApiTabProps) {
	const { toast } = useToast();

	const deleteExpenseCode = `
const expenseIdToDelete = '<EXPENSE_ID_HERE>';
fetch('https://dinherin.com/api/expenses/' + expenseIdToDelete, {
  method: 'DELETE',
  headers: {
    'API_KEY': '${apiKey}'
  }
})
.then(response => {
  if (!response.ok) throw new Error('Failed to delete expense: ' + response.status);
  console.log('Expense deleted successfully');
})
.catch(error => console.error(error));
`;

	const getAllExpensesCode = `
fetch('https://dinherin.com/api/expenses', {
  method: 'GET',
  headers: {
    'API_KEY': '${apiKey}'
  }
})
.then(response => response.json())
.then(data => console.log('All expenses:', data))
.catch(error => console.error('Error fetching expenses:', error));
`;

	const getExpenseByIdCode = `
const expenseId = '<EXPENSE_ID_HERE>';
fetch('https://dinherin.com/api/expenses/' + expenseId, {
  method: 'GET',
  headers: {
    'API_KEY': '${apiKey}'
  }
})
.then(response => response.json())
.then(data => console.log('Expense details:', data))
.catch(error => console.error('Error fetching expense:', error));
`;

	const updateExpenseCode = `
const expenseIdToUpdate = '<EXPENSE_ID_HERE>';
fetch('https://dinherin.com/api/expenses/' + expenseIdToUpdate, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'API_KEY': '${apiKey}'
  },
  body: JSON.stringify({
    title: 'Ifood',
    amount: 25.90,
    date: '2026-05-26',
    category_id: 'food'
  })
})
.then(response => {
  if (!response.ok) throw new Error('Failed to update expense: ' + response.status);
  return response.json();
})
.then(data => console.log('Expense updated:', data))
.catch(error => console.error('Error updating expense:', error));
`;

	const getExpenseByCategoryCode = `
fetch('https://dinherin.com/api/expenses/category/food', {
  method: 'GET',
  headers: {
    'API_KEY': '${apiKey}'
  }
})
.then(response => response.json())
.then(data => console.log('Food expenses:', data))
.catch(error => console.error('Error fetching category expenses:', error));
`;

	const createExpenseCode = `
fetch('https://dinherin.com/api/expenses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'API_KEY': '${apiKey}'
  },
  body: JSON.stringify({
    title: 'PS5',
    amount: 2999.00,
    date: '2025-06-20',
    category_id: 'entertainment'
  })
})
  .then(response => {
    if (!response.ok) {
      throw new Error('HTTP error! Status: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    console.log('Expense created:', data);
  })
  .catch(error => {
    console.error('Error creating expense:', error);
  });`;

	const notifyCopiedAPIKEY = () => {
		toast({
			title: "API Key Copied",
			description: "The API key has been copied to the clipboard.",
		});
	};

	useEffect(() => {
		const clipboard = new ClipboardJS(".button_copy_api_key");
		return () => clipboard.destroy();
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle>API Documentation</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center space-x-2 mb-4">
					<Input
						name="api_key"
						id="api_key"
						type="text"
						defaultValue={apiKey}
						readOnly
						disabled
						className="bg-gray-100 dark:bg-gray-800"
					/>
					<Button
						onClick={notifyCopiedAPIKEY}
						className="fw-bold bg-blue-500 text-white hover:bg-blue-800 button_copy_api_key"
						data-clipboard-text={apiKey}
					>
						COPY API KEY
					</Button>
				</div>

				<h3 className="text-lg font-semibold mb-2">HTTP Request Examples</h3>

				<br />
				<h3>Create Expense</h3>
				<CodeBlockComponent code={createExpenseCode} />

				<br />
				<h3>Update Expense</h3>
				<CodeBlockComponent code={updateExpenseCode} />

				<br />
				<h3>Get Expense by ID</h3>
				<CodeBlockComponent code={getExpenseByIdCode} />

				<br />
				<h3>Get All Expenses</h3>
				<CodeBlockComponent code={getAllExpensesCode} />

				<br />
				<h3>Get Expenses by Category</h3>
				<CodeBlockComponent code={getExpenseByCategoryCode} />

				<br />
				<h3>Delete Expense</h3>
				<CodeBlockComponent code={deleteExpenseCode} />
			</CardContent>
		</Card>
	);
}
