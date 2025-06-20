"use client";

import type React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Eye, EyeOff, XCircle, Loader2, Lock, Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface PasswordValidation {
	length: boolean;
	uppercase: boolean;
	number: boolean;
	special: boolean;
}

interface FormState {
	password: string;
	confirmPassword: string;
	showPassword: boolean;
	showConfirmPassword: boolean;
	error: string;
	loading: boolean;
	success: boolean;
	tokenValid: boolean;
	tokenChecking: boolean;
}

export default function ResetPasswordClient(): React.ReactElement {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const { toast } = useToast();

	const [formState, setFormState] = useState<FormState>({
		password: "",
		confirmPassword: "",
		showPassword: false,
		showConfirmPassword: false,
		error: "",
		loading: false,
		success: false,
		tokenValid: false,
		tokenChecking: true,
	});

	const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
		length: false,
		uppercase: false,
		number: false,
		special: false,
	});

	const [passwordValid, setPasswordValid] = useState(false);

	const updateFormState = useCallback((updates: Partial<FormState>) => {
		setFormState((prev) => ({ ...prev, ...updates }));
	}, []);

	useEffect(() => {
		if (!authLoading && isAuthenticated) {
			router.push("/app");
			return;
		}

		if (!token || token.length !== 32) {
			router.push("/login");
			return;
		}

		const verifyToken = async () => {
			try {
				updateFormState({ tokenChecking: true });
				const response = await fetch(`/api/reset-password/verify?token=${token}`);

				if (!response.ok) {
					toast({
						title: "Invalid token",
						description: "The password reset link is invalid or has expired",
						variant: "error",
					});
					router.push("/forget-password");
					return;
				}

				updateFormState({ tokenValid: true });
			} catch (error) {
				console.error("Token verification error:", error);
				toast({
					title: "Verification error",
					description: "Could not verify the reset token",
					variant: "error",
				});
				router.push("/forget-password");
			} finally {
				updateFormState({ tokenChecking: false });
			}
		};

		verifyToken();
	}, [token, router, isAuthenticated, authLoading, updateFormState, toast]);

	useEffect(() => {
		const hasMinLength = formState.password.length >= 8;
		const hasUppercase = /[A-Z]/.test(formState.password);
		const hasNumber = /[0-9]/.test(formState.password);
		const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formState.password);

		setPasswordValidation({
			length: hasMinLength,
			uppercase: hasUppercase,
			number: hasNumber,
			special: hasSpecial,
		});

		setPasswordValid(hasMinLength && hasUppercase && hasNumber && hasSpecial);
	}, [formState.password]);

	const validateForm = useCallback((): boolean => {
		if (!passwordValid) {
			updateFormState({ error: "Please fix the password requirements before continuing" });
			return false;
		}

		if (formState.password !== formState.confirmPassword) {
			updateFormState({ error: "The new password and confirmation do not match" });
			return false;
		}

		if (formState.password.length < 8) {
			updateFormState({ error: "Password must be at least 8 characters long" });
			return false;
		}

		return true;
	}, [passwordValid, formState.password, formState.confirmPassword, updateFormState]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			updateFormState({ error: "" });

			if (!validateForm()) {
				return;
			}

			updateFormState({ loading: true });

			try {
				const response = await fetch("/api/reset-password/reset", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						token,
						password: formState.password.trim(),
					}),
				});

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to reset password");
				}

				updateFormState({ success: true });

				toast({
					title: "Password reset successfully!",
					description: "You will be redirected to the login page",
				});

				setTimeout(() => {
					router.push("/login");
				}, 3000);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "An error occurred while resetting your password";

				updateFormState({ error: errorMessage });

				toast({
					title: "Error resetting password",
					description: errorMessage,
					variant: "error",
				});
			} finally {
				updateFormState({ loading: false });
			}
		},
		[validateForm, token, formState.password, updateFormState, toast, router],
	);

	const handlePasswordChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateFormState({
				password: e.target.value,
				error: "",
			});
		},
		[updateFormState],
	);

	const handleConfirmPasswordChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateFormState({
				confirmPassword: e.target.value,
				error: "",
			});
		},
		[updateFormState],
	);

	if (authLoading || formState.tokenChecking) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin" />
					<p>Verifying reset token...</p>
				</div>
			</div>
		);
	}

	if (!formState.tokenValid && !formState.tokenChecking) {
		router.push("/forget-password");
		return <div />;
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
			<div className="w-full max-w-md">
				<Card className="bg-black border-none text-white shadow-xl">
					<CardHeader className="space-y-1 text-center">
						<div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
							<Lock className="h-6 w-6 text-white" />
						</div>
						<CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
						<CardDescription className="text-gray-400">
							Create a new secure password for your account
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
								<Shield className="h-12 w-12 text-green-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-green-400 mb-2">Password Reset!</h3>
								<p className="text-green-300 text-sm mb-4">
									Your password has been successfully changed.
								</p>
								<p className="text-gray-400 text-xs">Redirecting to login...</p>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="password" className="text-sm font-medium">
										New Password
									</Label>
									<div className="relative">
										<Input
											id="password"
											type={formState.showPassword ? "text" : "password"}
											value={formState.password}
											onChange={handlePasswordChange}
											required
											disabled={formState.loading}
											className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 pr-10"
											placeholder="Enter your new password"
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
											onClick={() => updateFormState({ showPassword: !formState.showPassword })}
											disabled={formState.loading}
										>
											{formState.showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>

									{formState.password && (
										<div className="mt-3 p-3 bg-gray-800 rounded-lg">
											<p className="font-medium text-sm mb-2 text-gray-300">
												Password requirements:
											</p>
											<div className="space-y-1">
												<div className="flex items-center text-xs">
													{passwordValidation.length ? (
														<CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />
													) : (
														<XCircle className="h-3 w-3 text-red-500 mr-2" />
													)}
													<span
														className={
															passwordValidation.length
																? "text-green-400"
																: "text-red-400"
														}
													>
														At least 8 characters
													</span>
												</div>
												<div className="flex items-center text-xs">
													{passwordValidation.uppercase ? (
														<CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />
													) : (
														<XCircle className="h-3 w-3 text-red-500 mr-2" />
													)}
													<span
														className={
															passwordValidation.uppercase
																? "text-green-400"
																: "text-red-400"
														}
													>
														At least 1 uppercase letter
													</span>
												</div>
												<div className="flex items-center text-xs">
													{passwordValidation.number ? (
														<CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />
													) : (
														<XCircle className="h-3 w-3 text-red-500 mr-2" />
													)}
													<span
														className={
															passwordValidation.number
																? "text-green-400"
																: "text-red-400"
														}
													>
														At least 1 number
													</span>
												</div>
												<div className="flex items-center text-xs">
													{passwordValidation.special ? (
														<CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />
													) : (
														<XCircle className="h-3 w-3 text-red-500 mr-2" />
													)}
													<span
														className={
															passwordValidation.special
																? "text-green-400"
																: "text-red-400"
														}
													>
														At least 1 special character
													</span>
												</div>
											</div>
										</div>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirm-password" className="text-sm font-medium">
										Confirm New Password
									</Label>
									<div className="relative">
										<Input
											id="confirm-password"
											type={formState.showConfirmPassword ? "text" : "password"}
											value={formState.confirmPassword}
											onChange={handleConfirmPasswordChange}
											required
											disabled={formState.loading}
											className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 pr-10"
											placeholder="Confirm your new password"
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
											onClick={() =>
												updateFormState({ showConfirmPassword: !formState.showConfirmPassword })
											}
											disabled={formState.loading}
										>
											{formState.showConfirmPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>

								<Button
									type="submit"
									className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
									disabled={
										formState.loading ||
										!passwordValid ||
										formState.password !== formState.confirmPassword
									}
								>
									{formState.loading ? (
										<div className="flex items-center justify-center">
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Resetting...
										</div>
									) : (
										<>
											<Lock className="mr-2 h-4 w-4" />
											Reset Password
										</>
									)}
								</Button>
							</form>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
