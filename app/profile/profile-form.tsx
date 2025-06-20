"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";
import { useState, useEffect } from "react";

export function ProfileForm() {
	const { session, updateProfile, deleteAccount, isUpdatingProfile, isDeletingAccount } = useProfile();
	const [name, setName] = useState(session?.user?.name || "");
	const [errors, setErrors] = useState({ name: false });

	useEffect(() => {
		if (session?.user?.name) {
			setName(session.user.name);
		}
	}, [session?.user?.name]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim() || name.length < 4 || name.length > 16) {
			setErrors({ name: true });
			return;
		}

		updateProfile({ name });
	};

	const handleDeleteAccount = () => {
		if (confirm("Are you sure you want to delete your account?")) {
			deleteAccount();
		}
	};

	return (
		<Card>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-2 mt-3">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => {
								if (e.target.value.length <= 16) {
									setName(e.target.value);
									setErrors({ name: false });
								}
							}}
							className={`max-w-md ${errors.name ? "border-red-500" : ""}`}
							maxLength={16}
						/>
						{errors.name && (
							<p className="text-red-500 text-sm">Invalid name (must be between 4 and 16 characters)</p>
						)}
						<p className="text-sm text-gray-500">{name.length}/16 characters</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={session?.user?.email as string}
							disabled
							className="max-w-md bg-gray-100 dark:bg-gray-800"
						/>
						<p className="text-sm text-gray-500">Email cannot be changed</p>
					</div>
					<Button
						type="submit"
						className="bg-green-500 hover:bg-green-800 text-white"
						disabled={isUpdatingProfile}
					>
						{isUpdatingProfile ? "Updating..." : "Save Changes"}
					</Button>
					<hr />
				</form>
				<div className="flex flex-col justify-end items-end h-full">
					<Button
						onClick={handleDeleteAccount}
						disabled={isDeletingAccount}
						className="bg-red-500 hover:bg-red-800 mt-5 text-white"
					>
						{isDeletingAccount ? "Deleting account..." : "Delete Account"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
