"use server";

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import type { CreateUserInputInterface, UpdateUserProfileInputInterface, UserInterface } from "@/types/user.types";
import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/prisma/prisma-client";
import { generateApiKey } from "../utils/generate-api-key.util";

const CACHE_TAGS = {
	USER: "user",
	USERS: "users",
} as const;

const CACHE_REVALIDATE_TIME = 300;

export const getUserByEmailCached = unstable_cache(
	async (email: string): Promise<UserInterface | null> => {
		try {
			const user = await prisma.user.findUnique({
				where: { email },
			});
			return user;
		} catch (error) {
			console.error("Error fetching user by email:", error);
			throw new Error("Failed to fetch user");
		}
	},
	["user-by-email"],
	{
		tags: [CACHE_TAGS.USER],
		revalidate: CACHE_REVALIDATE_TIME,
	},
);

export const getUserByIdCached = unstable_cache(
	async (id: string): Promise<UserInterface | null> => {
		try {
			const user = await prisma.user.findUnique({
				where: { id },
			});
			return user;
		} catch (error) {
			console.error("Error fetching user by id:", error);
			throw new Error("Failed to fetch user by id");
		}
	},
	["user-by-id"],
	{
		tags: [CACHE_TAGS.USER],
		revalidate: CACHE_REVALIDATE_TIME,
	},
);

export const getUserByApiKeyCached = unstable_cache(
	async (apiKey: string): Promise<UserInterface | null> => {
		try {
			const user = await prisma.user.findUnique({
				where: { api_key: apiKey },
			});
			return user;
		} catch (error) {
			console.error("Error fetching user by API key:", error);
			throw new Error("Failed to fetch user by API key");
		}
	},
	["user-by-api-key"],
	{
		tags: [CACHE_TAGS.USER],
		revalidate: CACHE_REVALIDATE_TIME,
	},
);

export async function getUserByEmail(email: string): Promise<UserInterface | null> {
	try {
		const user = await prisma.user.findUnique({
			where: { email },
		});
		return user;
	} catch (error) {
		console.error("Error fetching user by email:", error);
		throw new Error("Failed to fetch user");
	}
}

export async function getUserById(id: string): Promise<UserInterface | null> {
	try {
		const user = await prisma.user.findUnique({
			where: { id },
		});
		return user;
	} catch (error) {
		console.error("Error fetching user by id:", error);
		throw new Error("Failed to fetch user by id");
	}
}

export async function getUserByApiKey(apiKey: string): Promise<UserInterface | null> {
	try {
		const user = await prisma.user.findUnique({
			where: { api_key: apiKey },
		});
		return user;
	} catch (error) {
		console.error("Error fetching user by API key:", error);
		throw new Error("Failed to fetch user by API key");
	}
}

export async function createUser({ name, email, password }: CreateUserInputInterface): Promise<UserInterface> {
	try {
		const existingUser = await getUserByEmail(email);
		if (existingUser) {
			return existingUser;
		}

		let hashedPassword: string | null = null;
		if (password) {
			hashedPassword = await bcrypt.hash(password, 12);
		}

		const apiKey = generateApiKey();

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				api_key: apiKey,
			},
		});

		revalidateTag(CACHE_TAGS.USER);
		revalidateTag(CACHE_TAGS.USERS);

		return user;
	} catch (error) {
		console.error("Error creating user:", error);
		throw new Error("Failed to create user");
	}
}

export async function verifyCredentials(email: string, password: string): Promise<UserInterface | null> {
	try {
		const user = await getUserByEmail(email);

		if (!user) {
			return null;
		}

		if (!user.password) {
			throw new Error("no_password");
		}

		const isValid = await bcrypt.compare(password, user.password);

		if (!isValid) {
			return null;
		}

		return user;
	} catch (error) {
		if (error instanceof Error && error.message === "no_password") {
			throw error;
		}
		console.error("Error verifying credentials:", error);
		throw new Error("Failed to verify credentials");
	}
}

export async function updateUserProfile(
	userId: string,
	{ name, email }: UpdateUserProfileInputInterface,
): Promise<{ success: boolean }> {
	try {
		await prisma.user.update({
			where: { id: userId },
			data: {
				name,
				email,
				updated_at: new Date(),
			},
		});

		revalidateTag(CACHE_TAGS.USER);

		return { success: true };
	} catch (error) {
		console.error("Error updating user profile:", error);
		throw new Error("Failed to update user profile");
	}
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean }> {
	try {
		const hashedPassword = await bcrypt.hash(newPassword, 12);

		await prisma.user.update({
			where: { id: userId },
			data: {
				password: hashedPassword,
				updated_at: new Date(),
			},
		});

		revalidateTag(CACHE_TAGS.USER);

		return { success: true };
	} catch (error) {
		console.error("Error updating user password:", error);
		throw new Error("Failed to update user password");
	}
}

export async function createPassword(userEmail: string, newPassword: string): Promise<{ success: boolean }> {
	try {
		const hashedPassword = await bcrypt.hash(newPassword, 12);
		const apiKey = generateApiKey();

		await prisma.user.update({
			where: { email: userEmail },
			data: {
				password: hashedPassword,
				api_key: apiKey,
				updated_at: new Date(),
			},
		});

		revalidateTag(CACHE_TAGS.USER);

		return { success: true };
	} catch (error) {
		console.error("Error creating password:", error);
		throw new Error("Failed to create password");
	}
}

export async function regenerateApiKey(userId: string): Promise<{ success: boolean; apiKey: string }> {
	try {
		const apiKey = generateApiKey();

		await prisma.user.update({
			where: { id: userId },
			data: {
				api_key: apiKey,
				updated_at: new Date(),
			},
		});

		revalidateTag(CACHE_TAGS.USER);

		return { success: true, apiKey };
	} catch (error) {
		console.error("Error regenerating API key:", error);
		throw new Error("Failed to regenerate API key");
	}
}

export async function softDeleteUser(userId: string): Promise<{ success: boolean }> {
	try {
		await prisma.user.update({
			where: { id: userId },
			data: {
				deleted_at: new Date(),
				updated_at: new Date(),
			},
		});

		revalidateTag(CACHE_TAGS.USER);
		revalidateTag(CACHE_TAGS.USERS);

		return { success: true };
	} catch (error) {
		console.error("Error soft deleting user:", error);
		throw new Error("Failed to delete user");
	}
}

export async function getUserWithRelations(userId: string) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				expenses: {
					orderBy: { created_at: "desc" },
					take: 10,
				},
				subscriptions: {
					orderBy: { created_at: "desc" },
				},
			},
		});

		return user;
	} catch (error) {
		console.error("Error fetching user with relations:", error);
		throw new Error("Failed to fetch user with relations");
	}
}

export async function isUserActive(userId: string): Promise<boolean> {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				deleted_at: null,
			},
			select: { id: true },
		});

		return !!user;
	} catch (error) {
		console.error("Error checking if user is active:", error);
		return false;
	}
}

export async function getUsersByEmails(emails: string[]): Promise<UserInterface[]> {
	try {
		const users = await prisma.user.findMany({
			where: {
				email: {
					in: emails,
				},
				deleted_at: null,
			},
		});

		return users;
	} catch (error) {
		console.error("Error fetching users by emails:", error);
		throw new Error("Failed to fetch users by emails");
	}
}
