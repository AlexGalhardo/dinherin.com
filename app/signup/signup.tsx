"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Mail, Lock, User, UserPlus, Check, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { createUser, getUserByEmail } from "@/lib/services/user-service";

const signupSchema = z.object({
	name: z.string().min(4, "Name must be at least 4 characters").max(32, "Name must be at most 32 characters"),
	email: z.string().email("Email must be valid"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/(?=.*[a-z])/, "Password must contain at least 1 lowercase letter")
		.regex(/(?=.*[A-Z])/, "Password must contain at least 1 uppercase letter")
		.regex(/(?=.*\d)/, "Password must contain at least 1 number")
		.regex(/(?=.*[!@#$%^&*(),.?\":{}|<>])/, "Password must contain at least 1 special character"),
});

interface FormState {
	name: string;
	email: string;
	password: string;
	showPassword: boolean;
	error: string;
	loading: boolean;
}

interface FormErrors {
	name?: string;
	email?: string;
	password?: string;
}

interface PasswordCriteria {
	length: boolean;
	uppercase: boolean;
	lowercase: boolean;
	number: boolean;
	special: boolean;
}

export default function SignupClient() {
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const router = useRouter();

	const [formState, setFormState] = useState<FormState>({
		name: "",
		email: "",
		password: "",
		showPassword: false,
		error: "",
		loading: false,
	});

	const [errors, setErrors] = useState<FormErrors>({});
	const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
	const [passwordCriteria, setPasswordCriteria] = useState<PasswordCriteria>({
		length: false,
		uppercase: false,
		lowercase: false,
		number: false,
		special: false,
	});
	const [newSubscriptionWarning, setNewSubscriptionWarning] = useState<string | null>(null);

	const updateFormState = useCallback((updates: Partial<FormState>) => {
		setFormState((prev) => ({ ...prev, ...updates }));
	}, []);

	const clearErrors = useCallback(() => {
		setErrors({});
		updateFormState({ error: "" });
	}, [updateFormState]);

	useEffect(() => {
		if (searchParams.get("trial") === "true") {
			setNewSubscriptionWarning("Create your account to start your free trial!");
		}
	}, [searchParams]);

	useEffect(() => {
		const error = searchParams.get("error");
		if (error) {
			let errorMessage = "Error creating account";

			switch (error) {
				case "OAuthSignin":
				case "OAuthCallback":
				case "OAuthCreateAccount":
					errorMessage = "Error creating account with Google";
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
				case "CredentialsSignup":
					break;
				default:
					errorMessage = "Unknown error creating account";
			}

			updateFormState({ error: errorMessage });
			toast({
				title: "Error creating account",
				description: errorMessage,
				variant: "error",
			});
		}
	}, [searchParams, updateFormState, toast]);

	useEffect(() => {
		if (formState.password.length > 0) {
			setPasswordCriteria({
				length: formState.password.length >= 8,
				uppercase: /[A-Z]/.test(formState.password),
				lowercase: /[a-z]/.test(formState.password),
				number: /[0-9]/.test(formState.password),
				special: /[^A-Za-z0-9]/.test(formState.password),
			});
		} else {
			setPasswordCriteria({
				length: false,
				uppercase: false,
				lowercase: false,
				number: false,
				special: false,
			});
		}
	}, [formState.password]);

	const validateForm = useCallback((): boolean => {
		try {
			signupSchema.parse({
				name: formState.name.trim(),
				email: formState.email.trim(),
				password: formState.password,
			});
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors: FormErrors = {};
				error.errors.forEach((err) => {
					const field = err.path[0] as keyof FormErrors;
					newErrors[field] = err.message;
				});
				setErrors(newErrors);
			}
			return false;
		}
	}, [formState.name, formState.email, formState.password]);

	const handleNameChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const capitalizedName = e.target.value
				.split(" ")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
				.join(" ");

			updateFormState({ name: capitalizedName });

			if (errors.name) {
				setErrors((prev) => ({ ...prev, name: undefined }));
			}
		},
		[updateFormState, errors.name],
	);

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

	const handleSignup = useCallback(
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
				const name = formState.name.trim();
				const email = formState.email.trim().toLowerCase();
				const password = formState.password;

				const existingUser = await getUserByEmail(email);

				if (existingUser) {
					updateFormState({
						error: "Email already registered",
						name: "",
						email: "",
						password: "",
						loading: false,
					});
					toast({
						title: "Error creating account",
						description: "Email already registered",
						variant: "error",
					});
					return;
				}

				await createUser({ name, email, password });

				const result = await signIn("credentials", {
					redirect: false,
					email,
					password,
				});

				if (result?.error) {
					updateFormState({
						error: "Error logging in after registration",
						name: "",
						email: "",
						password: "",
						loading: false,
					});
					toast({
						title: "Error logging in",
						description: "Error logging in after registration",
						variant: "error",
					});
					return;
				}

				if (newSubscriptionWarning) {
					const res = await fetch("/api/checkout/stripe", {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							stripe_testing_subscription_finished: "false",
							name,
							email,
						},
					});

					const data = await res.json();
					window.location.href = data.stripe_checkout_url;
				}

				toast({
					title: "Account created successfully",
					description: "Redirecting...",
					variant: "default",
				});
				router.push("/app");
			} catch (err: any) {
				const errorMessage =
					err instanceof Error ? err.message : "There was an error creating your account. Please try again.";
				updateFormState({ error: errorMessage });
				toast({
					title: "Error creating account",
					description: errorMessage,
					variant: "error",
				});
			} finally {
				updateFormState({ loading: false });
			}
		},
		[
			clearErrors,
			validateForm,
			formState.name,
			formState.email,
			formState.password,
			newSubscriptionWarning,
			updateFormState,
			toast,
			router,
		],
	);

	const handleGoogleSignup = useCallback(async () => {
		try {
			if (newSubscriptionWarning) {
				const res = await fetch("/api/checkout/stripe", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						stripe_testing_subscription_finished: "false",
						name: formState.name,
						email: formState.email,
					},
				});

				const data = await res.json();
				signIn("google", { callbackUrl: data.stripe_checkout_url });
			} else {
				signIn("google", { callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/app` });
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Error creating account with Google";
			toast({
				title: "Google signup error",
				description: errorMessage,
				variant: "error",
			});
		}
	}, [formState.name, formState.email, newSubscriptionWarning, toast]);

	const CriteriaItem = ({ met, text }: { met: boolean; text: string }) => (
		<div className="flex items-center space-x-2">
			{met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
			<span className={`text-sm ${met ? "text-green-500" : "text-gray-400"}`}>{text}</span>
		</div>
	);

	return (
		<div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
			<div className="w-full max-w-md">
				<Card className="bg-black border-none text-white shadow-xl">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold">Create Account</CardTitle>
						<CardDescription className="text-gray-400 mb-3 mt-3">
							Create your account to get started
						</CardDescription>
						{newSubscriptionWarning && (
							<div>
								<Alert className="bg-blue-900/20 border-orange-800 mt-6 mb-3">
									<AlertDescription className="text-orange-500 font-bold">
										{newSubscriptionWarning}
									</AlertDescription>
								</Alert>
							</div>
						)}
					</CardHeader>

					<CardContent className="space-y-4">
						{formState.error && (
							<Alert variant="destructive" className="bg-red-900/20 border-red-800">
								<AlertDescription className="text-red-400">{formState.error}</AlertDescription>
							</Alert>
						)}

						<Button
							onClick={handleGoogleSignup}
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

						<form onSubmit={handleSignup} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name" className="text-sm font-medium">
									Name
								</Label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="name"
										type="text"
										maxLength={32}
										minLength={4}
										placeholder="Your name"
										value={formState.name}
										onChange={handleNameChange}
										className={`pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 ${
											errors.name ? "border-red-500" : ""
										}`}
										disabled={formState.loading}
										autoComplete="name"
									/>
								</div>
								{errors.name && (
									<Alert variant="destructive" className="py-2">
										<AlertDescription className="text-sm">{errors.name}</AlertDescription>
									</Alert>
								)}
							</div>

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
										onFocus={() => setShowPasswordCriteria(true)}
										className={`pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 ${
											errors.password ? "border-red-500" : ""
										}`}
										disabled={formState.loading}
										autoComplete="new-password"
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

								{showPasswordCriteria && (
									<div className="mt-2 p-3 bg-gray-800/50 border border-gray-700 rounded-md">
										<p className="text-sm text-gray-400 mb-2">Your password must contain:</p>
										<div className="space-y-1">
											<CriteriaItem met={passwordCriteria.length} text="At least 8 characters" />
											<CriteriaItem
												met={passwordCriteria.uppercase}
												text="At least 1 uppercase letter (A-Z)"
											/>
											<CriteriaItem
												met={passwordCriteria.lowercase}
												text="At least 1 lowercase letter (a-z)"
											/>
											<CriteriaItem
												met={passwordCriteria.number}
												text="At least 1 number (0-9)"
											/>
											<CriteriaItem
												met={passwordCriteria.special}
												text="At least 1 special character (!@#$...)"
											/>
										</div>
									</div>
								)}

								{errors.password && (
									<Alert variant="destructive" className="py-2">
										<AlertDescription className="text-sm">{errors.password}</AlertDescription>
									</Alert>
								)}
							</div>

							<Button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
								disabled={formState.loading}
							>
								{formState.loading ? (
									<div className="flex items-center justify-center">
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating account...
									</div>
								) : (
									<>
										<UserPlus className="mr-2 h-4 w-4" />
										Create account
									</>
								)}
							</Button>
						</form>
					</CardContent>

					<CardFooter className="flex flex-col space-y-4">
						<div className="text-center text-sm text-gray-400">
							Already have an account?{" "}
							<Link
								href="/login"
								className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
							>
								Sign in
							</Link>
						</div>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
