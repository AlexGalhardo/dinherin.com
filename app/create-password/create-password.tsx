"use client";

import type React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPassword } from "@/lib/services/user-service";
import { AlertCircle, CheckCircle2, Eye, EyeOff, XCircle, Loader2, Lock, User, Mail } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/loading-screen";

interface PasswordValidation {
	length: boolean;
	uppercase: boolean;
	number: boolean;
	special: boolean;
}

interface FormState {
	name: string;
	email: string;
	password: string;
	error: string;
	loading: boolean;
	showPassword: boolean;
	dataLoaded: boolean;
}

export default function CreatePasswordClient(): React.ReactElement {
	const { data: session } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();

	const [formState, setFormState] = useState<FormState>({
		name: "",
		email: "",
		password: "",
		error: "",
		loading: false,
		showPassword: false,
		dataLoaded: false,
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
		if (session) {
			router.push("/app");
		}
	}, [session, router]);

	useEffect(() => {
		const fetchUserData = async () => {
			const sessionId = searchParams.get("session_id");

			if (!sessionId) {
				console.warn("session_id not found in URL");
				toast({
					title: "Sessão inválida",
					description: "ID da sessão não encontrado na URL",
					variant: "error",
				});
				router.push("/");
				return;
			}

			try {
				const response = await fetch("/api/user/get-name-email", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						sessionId: sessionId,
					},
				});

				const data = await response.json();

				if (data.success) {
					updateFormState({
						name: data.customerName || "",
						email: data.customerEmail || "",
						dataLoaded: true,
					});
				} else {
					throw new Error(data.error || "Falha ao carregar dados do usuário");
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
				const errorMessage = error instanceof Error ? error.message : "Erro ao carregar dados do usuário";

				updateFormState({
					error: errorMessage,
					dataLoaded: true,
				});

				toast({
					title: "Erro ao carregar dados",
					description: errorMessage,
					variant: "error",
				});
			}
		};

		fetchUserData();
	}, [searchParams, router, updateFormState, toast]);

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

	const handlePasswordChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateFormState({
				password: e.target.value,
				error: "",
			});
		},
		[updateFormState],
	);

	const handleCreatePassword = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			updateFormState({ error: "" });

			if (!passwordValid) {
				const errorMessage = "Por favor, corrija os requisitos de senha antes de continuar";
				updateFormState({ error: errorMessage });
				toast({
					title: "Senha inválida",
					description: errorMessage,
					variant: "error",
				});
				return;
			}

			if (!formState.email || !formState.password) {
				const errorMessage = "Email e senha são obrigatórios";
				updateFormState({ error: errorMessage });
				return;
			}

			updateFormState({ loading: true });

			try {
				await createPassword(formState.email, formState.password);

				toast({
					title: "Senha criada com sucesso!",
					description: "Fazendo login automaticamente...",
				});

				const result = await signIn("credentials", {
					redirect: false,
					email: formState.email,
					password: formState.password,
				});

				if (result?.error) {
					throw new Error("Erro ao fazer login após criar a senha");
				}

				toast({
					title: "Login realizado com sucesso!",
					description: "Redirecionando para o dashboard...",
				});
			} catch (error) {
				console.error("Error creating password:", error);
				const errorMessage =
					error instanceof Error ? error.message : "Ocorreu um erro ao criar sua senha. Tente novamente.";

				updateFormState({ error: errorMessage });

				toast({
					title: "Erro ao criar senha",
					description: errorMessage,
					variant: "error",
				});
			} finally {
				updateFormState({ loading: false });
			}
		},
		[passwordValid, formState.email, formState.password, updateFormState, toast],
	);

	if (!formState.dataLoaded) return <LoadingScreen />;

	return (
		<div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
			<div className="w-full max-w-md">
				<Card className="bg-gray-900 border-gray-800 text-white shadow-xl">
					<CardHeader className="space-y-1 text-center">
						<div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
							<Lock className="h-6 w-6 text-white" />
						</div>
						<CardTitle className="text-2xl font-bold tracking-wider">D I N H E R I N</CardTitle>
						<p className="text-gray-400 text-sm">Crie sua senha para finalizar o cadastro</p>
					</CardHeader>

					<CardContent className="space-y-4">
						{formState.error && (
							<Alert variant="destructive" className="bg-red-900/20 border-red-800">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription className="text-red-400">{formState.error}</AlertDescription>
							</Alert>
						)}

						<form onSubmit={handleCreatePassword} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name" className="text-sm font-medium">
									Nome
								</Label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="name"
										type="text"
										value={formState.name}
										disabled
										className="pl-10 bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed"
									/>
								</div>
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
										value={formState.email}
										disabled
										className="pl-10 bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password" className="text-sm font-medium">
									Senha
								</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="password"
										type={formState.showPassword ? "text" : "password"}
										value={formState.password}
										onChange={handlePasswordChange}
										required
										disabled={formState.loading}
										className={`pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500 ${
											formState.password && !passwordValid ? "border-red-500" : ""
										}`}
										placeholder="Digite sua senha"
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

								{formState.password && (
									<div className="mt-3 p-3 bg-gray-800 rounded-lg">
										<p className="font-medium text-sm mb-2 text-gray-300">A senha deve conter:</p>
										<div className="space-y-1">
											<div className="flex items-center text-xs">
												{passwordValidation.length ? (
													<CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />
												) : (
													<XCircle className="h-3 w-3 text-red-500 mr-2" />
												)}
												<span
													className={
														passwordValidation.length ? "text-green-400" : "text-red-400"
													}
												>
													Mínimo de 8 caracteres
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
														passwordValidation.uppercase ? "text-green-400" : "text-red-400"
													}
												>
													Pelo menos 1 letra maiúscula
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
														passwordValidation.number ? "text-green-400" : "text-red-400"
													}
												>
													Pelo menos 1 número
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
														passwordValidation.special ? "text-green-400" : "text-red-400"
													}
												>
													Pelo menos 1 caractere especial
												</span>
											</div>
										</div>
									</div>
								)}
							</div>

							<Button
								type="submit"
								className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
								disabled={formState.loading || (!!formState.password && !passwordValid)}
							>
								{formState.loading ? (
									<div className="flex items-center justify-center">
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Criando senha e fazendo login...
									</div>
								) : (
									<>
										<Lock className="mr-2 h-4 w-4" />
										Criar Senha e Fazer Login
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
