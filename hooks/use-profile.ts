"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface UpdateProfileData {
	name: string;
}

interface UpdatePasswordData {
	newPassword: string;
}

export function useProfile() {
	const { data: session, update } = useSession();
	const { toast } = useToast();
	const router = useRouter();
	const queryClient = useQueryClient();

	const updateProfileMutation = useMutation({
		mutationFn: async (data: UpdateProfileData) => {
			const response = await fetch("/api/user/update-profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Error updating profile");
			}

			return response.json();
		},
		onSuccess: async (_, variables) => {
			await update({ name: variables.name });
			toast({
				title: "Perfil atualizado",
				description: "Suas informações foram atualizadas com sucesso.",
			});
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		},
		onError: () => {
			toast({
				title: "Erro ao atualizar perfil",
				description: "Ocorreu um erro ao atualizar suas informações.",
				variant: "error",
			});
		},
	});

	const updatePasswordMutation = useMutation({
		mutationFn: async (data: UpdatePasswordData) => {
			const response = await fetch("/api/user/update-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Error updating password");
			}

			return response.json();
		},
		onSuccess: () => {
			toast({
				title: "Senha atualizada",
				description: "Sua senha foi atualizada com sucesso.",
			});
		},
		onError: (error: Error) => {
			toast({
				title: "Erro ao atualizar senha",
				description: error.message,
				variant: "error",
			});
		},
	});

	const deleteAccountMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/user/delete-account", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Error deleting account");
			}

			return response.json();
		},
		onSuccess: () => {
			toast({
				title: "Account Deleted",
				variant: "success",
			});

			signOut({ callbackUrl: "/login" });
		},
		onError: () => {
			toast({
				title: "Error deleting account",
				description: "Try again later",
				variant: "error",
			});
		},
	});

	return {
		session,
		updateProfile: updateProfileMutation.mutate,
		updatePassword: updatePasswordMutation.mutate,
		deleteAccount: deleteAccountMutation.mutate,
		isUpdatingProfile: updateProfileMutation.isPending,
		isUpdatingPassword: updatePasswordMutation.isPending,
		isDeletingAccount: deleteAccountMutation.isPending,
	};
}
