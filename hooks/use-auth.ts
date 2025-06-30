"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback } from "react";
import { createUser, getUserByEmail } from "@/lib/services/user-service";

export function useAuth() {
	const { data: session, status } = useSession();

	const loginWithCredentials = useCallback(async (email: string, password: string) => {
		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				return { success: false, error: result.error };
			}

			if (result?.ok) {
				return { success: true };
			}

			return { success: false, error: "Login failed" };
		} catch (error) {
			return { success: false, error: "Network error" };
		}
	}, []);

	const signupWithCredentials = useCallback(async (name: string, email: string, password: string) => {
		try {
			const existingUser = await getUserByEmail(email);

			if (existingUser) {
				return { success: false, error: "Email já está em uso" };
			}

			await createUser({ name, email, password });

			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				return { success: false, error: "Conta criada, mas erro ao fazer login" };
			}

			if (result?.ok) {
				return { success: true };
			}

			return { success: false, error: "Conta criada, mas erro ao fazer login" };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta";
			return { success: false, error: errorMessage };
		}
	}, []);

	const loginWithGoogle = useCallback(async () => {
		try {
			await signIn("google", {
				redirect: true,
				callbackUrl: "/dashboard",
			});
		} catch (error) {
			throw new Error("Google login failed");
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			await signOut({
				redirect: true,
				callbackUrl: "/",
			});
		} catch (error) {
			throw new Error("Logout failed");
		}
	}, []);

	return {
		user: session?.user,
		isAuthenticated: !!session,
		isLoading: status === "loading",
		loginWithCredentials,
		signupWithCredentials,
		loginWithGoogle,
		logout,
	};
}
