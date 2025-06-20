"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";
import { CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
import { useState } from "react";

interface PasswordValidation {
	length: boolean;
	uppercase: boolean;
	number: boolean;
	special: boolean;
}

export function ProfilePasswordForm() {
	const { updatePassword, isUpdatingPassword } = useProfile();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState({
		newPassword: false,
		confirmPassword: false,
	});
	const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
		length: false,
		uppercase: false,
		number: false,
		special: false,
	});

	const validatePassword = (password: string): boolean => {
		const hasMinLength = password.length >= 8;
		const hasUppercase = /[A-Z]/.test(password);
		const hasNumber = /[0-9]/.test(password);
		const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

		setPasswordValidation({
			length: hasMinLength,
			uppercase: hasUppercase,
			number: hasNumber,
			special: hasSpecial,
		});

		return hasMinLength && hasUppercase && hasNumber && hasSpecial;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const isNewPasswordValid = validatePassword(newPassword);
		if (!isNewPasswordValid) {
			setErrors((prev) => ({ ...prev, newPassword: true }));
			return;
		}

		if (newPassword !== confirmPassword) {
			setErrors((prev) => ({ ...prev, confirmPassword: true }));
			return;
		}

		updatePassword({ newPassword });
		setNewPassword("");
		setConfirmPassword("");
		setErrors({ newPassword: false, confirmPassword: false });
	};

	return (
		<Card>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4 mt-3">
					<div className="space-y-2">
						<Label htmlFor="new-password">New Password</Label>
						<div className="relative max-w-md">
							<Input
								id="new-password"
								type={showNewPassword ? "text" : "password"}
								value={newPassword}
								onChange={(e) => {
									setNewPassword(e.target.value);
									setErrors((prev) => ({ ...prev, newPassword: false }));
									validatePassword(e.target.value);
								}}
								className={errors.newPassword ? "border-red-500" : ""}
							/>
							<button
								type="button"
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
								onClick={() => setShowNewPassword(!showNewPassword)}
							>
								{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>

						{newPassword && (
							<div className="mt-2 text-sm space-y-1">
								<p className="font-medium">Password must contain:</p>
								<div className="flex items-center">
									{passwordValidation.length ? (
										<CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
									) : (
										<XCircle className="h-4 w-4 text-red-500 mr-2" />
									)}
									<span className={passwordValidation.length ? "text-green-500" : "text-red-500"}>
										Minimum 8 characters
									</span>
								</div>
								<div className="flex items-center">
									{passwordValidation.uppercase ? (
										<CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
									) : (
										<XCircle className="h-4 w-4 text-red-500 mr-2" />
									)}
									<span className={passwordValidation.uppercase ? "text-green-500" : "text-red-500"}>
										At least 1 uppercase letter
									</span>
								</div>
								<div className="flex items-center">
									{passwordValidation.number ? (
										<CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
									) : (
										<XCircle className="h-4 w-4 text-red-500 mr-2" />
									)}
									<span className={passwordValidation.number ? "text-green-500" : "text-red-500"}>
										At least 1 number
									</span>
								</div>
								<div className="flex items-center">
									{passwordValidation.special ? (
										<CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
									) : (
										<XCircle className="h-4 w-4 text-red-500 mr-2" />
									)}
									<span className={passwordValidation.special ? "text-green-500" : "text-red-500"}>
										At least 1 special character
									</span>
								</div>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirm-password">Confirm New Password</Label>
						<div className="relative max-w-md">
							<Input
								id="confirm-password"
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => {
									setConfirmPassword(e.target.value);
									setErrors((prev) => ({ ...prev, confirmPassword: false }));
								}}
								className={errors.confirmPassword ? "border-red-500" : ""}
							/>
							<button
								type="button"
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
						{errors.confirmPassword && <p className="text-red-500 text-sm">Passwords do not match</p>}
					</div>

					<Button
						type="submit"
						className="bg-green-500 hover:bg-green-800 text-white"
						disabled={isUpdatingPassword}
					>
						{isUpdatingPassword ? "Updating password..." : "Update Password"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
