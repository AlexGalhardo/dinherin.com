"use server";

import { revalidateTag } from "next/cache";
import { updateUserProfile, updateUserPassword, softDeleteUser } from "@/lib/services/user-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateProfileAction(name: string) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	try {
		await updateUserProfile(session.user.id, { name, email: session.user.email! });
		revalidateTag("user-profile");
		return { success: true };
	} catch (error) {
		throw new Error("Failed to update profile");
	}
}

export async function updatePasswordAction(newPassword: string) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	try {
		await updateUserPassword(session.user.id, newPassword);
		revalidateTag("user-profile");
		return { success: true };
	} catch (error) {
		throw new Error("Failed to update password");
	}
}

export async function deleteAccountAction() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.id) {
		throw new Error("Unauthorized");
	}

	try {
		await softDeleteUser(session.user.id);
		revalidateTag("user-profile");
		return { success: true };
	} catch (error) {
		throw new Error("Failed to delete account");
	}
}
