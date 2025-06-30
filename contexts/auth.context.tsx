"use client";

import type React from "react";
import { createContext, useContext, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthContextType {
	user: any;
	session: any;
	status: "loading" | "authenticated" | "unauthenticated";
	isLoading: boolean;
	isAuthenticated: boolean;
	signIn: (provider: string, options?: any) => Promise<any>;
	signOut: () => Promise<any>;
	loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	loginWithGoogle: () => Promise<void>;
	refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status, update } = useSession();
	const router = useRouter();

	const loginWithCredentials = useCallback(
		async (email: string, password: string) => {
			try {
				const result = await signIn("credentials", {
					redirect: false,
					email,
					password,
				});

				if (result?.error) {
					let errorMessage = "Invalid credentials";

					if (result.error.includes("Google")) {
						errorMessage =
							"This account was created with Google. Please sign in with Google and set up a password.";
					} else if (result.error === "CredentialsSignin") {
						errorMessage = "Invalid email or password";
					}

					return { success: false, error: errorMessage };
				}

				if (result?.ok) {
					setTimeout(() => {
						router.push("/dashboard");
					}, 100);

					return { success: true };
				}

				return { success: false, error: "Unknown error occurred" };
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Sign in failed";

				return { success: false, error: errorMessage };
			}
		},
		[router],
	);

	const loginWithGoogle = useCallback(async () => {
		try {
			await signIn("google", {
				callbackUrl: "/dashboard",
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Google sign in failed";
		}
	}, []);

	const handleSignOut = useCallback(async () => {
		try {
			await signOut({
				callbackUrl: "/login",
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Sign out failed";
		}
	}, []);

	const refreshSession = useCallback(async () => {
		try {
			await update();
		} catch (error) {
			console.error("Failed to refresh session:", error);
		}
	}, [update]);

	const value: AuthContextType = {
		user: session?.user,
		session,
		status,
		isLoading: status === "loading",
		isAuthenticated: status === "authenticated",
		signIn,
		signOut: handleSignOut,
		loginWithCredentials,
		loginWithGoogle,
		refreshSession,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
