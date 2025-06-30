"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Mail, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface FormState {
	email: string;
	password: string;
	showPassword: boolean;
	error: string;
	loading: boolean;
}

interface FormErrors {
	email?: string;
	password?: string;
}

export default function LoginClient() {
	const searchParams = useSearchParams();
	const { loginWithCredentials, loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();
	const { toast } = useToast();
	const router = useRouter();

	const [formState, setFormState] = useState<FormState>({
		email: "",
		password: "",
		showPassword: false,
		error: "",
		loading: false,
	});

	const [errors, setErrors] = useState<FormErrors>({});

	const updateFormState = useCallback((updates: Partial<FormState>) => {
		setFormState((prev) => ({ ...prev, ...updates }));
	}, []);

	const clearErrors = useCallback(() => {
		setErrors({});
		updateFormState({ error: "" });
	}, [updateFormState]);

	useEffect(() => {
		const error = searchParams.get("error");
		if (error) {
			let errorMessage = "Login error";

			switch (error) {
				case "CredentialsSignin":
					errorMessage = "Incorrect email or password";
					break;
				case "OAuthSignin":
				case "OAuthCallback":
				case "OAuthCreateAccount":
					errorMessage = "Error signing in with Google";
					break;
				case "EmailCreateAccount":
					errorMessage = "Error creating account with this email";
					break;
				case "Callback":
					errorMessage = "Authentication callback error";
					break;
				case "OAuthAccountNotLinked":
					errorMessage = "This account already exists with a different provider";
					break;
				case "EmailSignin":
					errorMessage = "Error sending verification email";
					break;
				case "CredentialsSignup":
					errorMessage = "Error creating account";
					break;
				case "SessionRequired":
					errorMessage = "Session expired, please login again";
					break;
				default:
					errorMessage = "Unknown login error";
			}

			updateFormState({ error: errorMessage });
			toast({
				title: "Authentication error",
				description: errorMessage,
				variant: "error",
			});
		}
	}, [searchParams, updateFormState, toast]);

	const validateForm = useCallback((): boolean => {
		const newErrors: FormErrors = {};

		if (!formState.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
			newErrors.email = "Invalid email";
		}

		if (!formState.password) {
			newErrors.password = "Password is required";
		} else if (formState.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formState.email, formState.password]);

	const handleEmailChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateFormState({ email: e.target.value });
			if (errors.email) {
				setErrors((prev) => ({ ...prev, email: undefined }));
			}
		},
		[updateFormState, errors.email],
	);

	const handlePasswordChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateFormState({ password: e.target.value });
			if (errors.password) {
				setErrors((prev) => ({ ...prev, password: undefined }));
			}
		},
		[updateFormState, errors.password],
	);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			clearErrors();

			if (!validateForm()) {
				toast({
					title: "Validation error",
					description: "Please correct the errors in the form",
					variant: "error",
				});
				return;
			}

			updateFormState({ loading: true });

			try {
				const result = await loginWithCredentials(formState.email.trim().toLowerCase(), formState.password);

				if (!result.success) {
					updateFormState({ error: result.error || "Login error" });
				} else {
					router.push("/dashboard");
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Internal server error";
				updateFormState({ error: errorMessage });
				toast({
					title: "Login error",
					description: errorMessage,
					variant: "error",
				});
			} finally {
				updateFormState({ loading: false });
			}
		},
		[clearErrors, validateForm, loginWithCredentials, formState.email, formState.password, updateFormState, toast],
	);

	const handleGoogleLogin = useCallback(async () => {
		try {
			await loginWithGoogle();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Error signing in with Google";
			toast({
				title: "Google login error",
				description: errorMessage,
				variant: "error",
			});
		}
	}, [loginWithGoogle, toast]);

	if (authLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin" />
					<p>Checking authentication...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
			<div className="w-full max-w-md">
				<Card className="bg-black border-none text-white shadow-xl">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold">Login</CardTitle>
						<CardDescription className="text-gray-400">Sign in to your account to continue</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						{formState.error && (
							<Alert variant="destructive" className="bg-red-900/20 border-red-800">
								<AlertDescription className="text-red-400">{formState.error}</AlertDescription>
							</Alert>
						)}

						<Button
							onClick={handleGoogleLogin}
							className="w-full bg-white text-black hover:bg-red-500 hover:text-white border-gray-300"
							disabled={formState.loading}
						>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
								<path
									fill="currentColor"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="currentColor"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="currentColor"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="currentColor"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Continue with Google
						</Button>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<Separator className="w-full bg-gray-700" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
							</div>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium">
									Email
								</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="email"
										type="email"
										placeholder="your@email.com"
										value={formState.email}
										onChange={handleEmailChange}
										className={`pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 ${
											errors.email ? "border-red-500" : ""
										}`}
										disabled={formState.loading}
										autoComplete="email"
									/>
								</div>
								{errors.email && (
									<Alert variant="destructive" className="py-2">
										<AlertDescription className="text-sm">{errors.email}</AlertDescription>
									</Alert>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password" className="text-sm font-medium">
									Password
								</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="password"
										type={formState.showPassword ? "text" : "password"}
										placeholder="Your password"
										value={formState.password}
										onChange={handlePasswordChange}
										className={`pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 ${
											errors.password ? "border-red-500" : ""
										}`}
										disabled={formState.loading}
										autoComplete="current-password"
									/>
									<button
										type="button"
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
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
								{errors.password && (
									<Alert variant="destructive" className="py-2">
										<AlertDescription className="text-sm">{errors.password}</AlertDescription>
									</Alert>
								)}
							</div>

							<div className="flex items-center justify-end">
								<Link
									href="/forget-password"
									className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
								>
									Forgot password?
								</Link>
							</div>

							<Button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
								disabled={formState.loading}
							>
								{formState.loading ? (
									<div className="flex items-center justify-center">
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Signing in...
									</div>
								) : (
									<>
										<LogIn className="mr-2 h-4 w-4" />
										Sign In
									</>
								)}
							</Button>
						</form>
					</CardContent>

					<CardFooter className="flex flex-col space-y-4">
						<div className="text-center text-sm text-gray-400">
							Don't have an account?{" "}
							<Link
								href="/signup"
								className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
							>
								Create account
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
