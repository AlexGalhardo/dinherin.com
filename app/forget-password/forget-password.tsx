"use client";

import type React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ChevronLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface FormState {
	email: string;
	error: string;
	loading: boolean;
	success: boolean;
}

export default function ForgetPasswordClient() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();

	const [formState, setFormState] = useState<FormState>({
		email: "",
		error: "",
		loading: false,
		success: false,
	});

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			router.push("/dashboard");
		}
	}, [isAuthenticated, isLoading, router]);

	const updateFormState = (updates: Partial<FormState>) => {
		setFormState((prev) => ({ ...prev, ...updates }));
	};

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmitForgetPassword = async (e: React.FormEvent) => {
		e.preventDefault();

		updateFormState({ error: "" });

		if (!formState.email.trim()) {
			updateFormState({ error: "Please enter your email" });
			return;
		}

		if (!validateEmail(formState.email)) {
			updateFormState({ error: "Please enter a valid email" });
			return;
		}

		updateFormState({ loading: true });

		try {
			const response = await fetch("/api/reset-password/request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: formState.email.trim().toLowerCase() }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Error sending recovery email");
			}

			updateFormState({ success: true });
		} catch (error) {
			console.error("Password reset request error:", error);

			const errorMessage = error instanceof Error ? error.message : "Internal server error. Please try again.";

			updateFormState({ error: errorMessage });
		} finally {
			updateFormState({ loading: false });
		}
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateFormState({
			email: e.target.value,
			error: "",
		});
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
			<div className="w-full max-w-md">
				<div className="mb-6">
					<Link
						href="/login"
						className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
					>
						<ChevronLeft className="mr-2 h-4 w-4" />
						Back to login
					</Link>
				</div>

				<Card className="bg-black border-none text-white shadow-xl">
					<CardHeader className="space-y-1 text-center">
						<div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
							<Mail className="h-6 w-6 text-white" />
						</div>
						<CardTitle className="text-2xl font-bold">Recover Password</CardTitle>
						<CardDescription className="text-gray-400">
							Enter your email to receive a password reset link
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						{formState.error && (
							<Alert variant="destructive" className="bg-red-900/20 border-red-800">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription className="text-red-400">{formState.error}</AlertDescription>
							</Alert>
						)}

						{formState.success ? (
							<div className="text-center p-6 bg-green-900/20 border border-green-800 rounded-lg">
								<CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-green-400 mb-2">Email Sent!</h3>
								<p className="text-green-300 text-sm mb-4">
									If the email is registered, you will receive a link to reset your password.
								</p>
								<p className="text-gray-400 text-xs">Also check your spam folder.</p>
							</div>
						) : (
							<form onSubmit={handleSubmitForgetPassword} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email" className="text-sm font-medium">
										Email
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="your@email.com"
										value={formState.email}
										onChange={handleEmailChange}
										required
										disabled={formState.loading}
										className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
										autoComplete="email"
									/>
								</div>

								<Button
									type="submit"
									className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
									disabled={formState.loading || !formState.email.trim()}
								>
									{formState.loading ? (
										<div className="flex items-center justify-center">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Sending...
										</div>
									) : (
										"Send recovery link"
									)}
								</Button>
							</form>
						)}
					</CardContent>

					<CardFooter className="flex flex-col space-y-4">
						<div className="text-center text-sm text-gray-400">
							Remembered your password?{" "}
							<Link
								href="/login"
								className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
							>
								Log in
							</Link>
						</div>

						{!formState.success && (
							<div className="text-center text-xs text-gray-500">
								Don't have an account?{" "}
								<Link
									href="/signup"
									className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
								>
									Create one
								</Link>
							</div>
						)}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
