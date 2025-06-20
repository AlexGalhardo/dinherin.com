"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileHeader } from "./profile-header";
import { ProfileForm } from "./profile-form";
import { ProfilePasswordForm } from "./profile-password-form";
import { ProfileApiTab } from "./profile-api-tab";
import { ProfileSubscriptionTab } from "./profile-subscription-tab";
import LoadingScreen from "@/components/loading-screen";

export default function ProfilePage() {
	const { data: session, status, update } = useSession();
	const router = useRouter();
	const [hasUpdated, setHasUpdated] = useState(false);

	useEffect(() => {
		async function checkAuthAndUpdate() {
			if (status === "unauthenticated") {
				router.push("/login");
			} else if (status === "authenticated" && !hasUpdated) {
				await update();
				setHasUpdated(true);
			}
		}
		checkAuthAndUpdate();
	}, [status, router, update, hasUpdated]);

	if (status === "loading") return <LoadingScreen />;

	if (!session) return null;

	return (
		<div className="min-h-screen dark:bg-black">
			<ProfileHeader userName={session.user?.name} />

			<main className="max-w-3xl mx-auto px-4 py-6">
				<Tabs defaultValue="profile" className="w-full">
					<TabsList className="mb-6">
						<TabsTrigger value="subscription" autoFocus>
							Subscription
						</TabsTrigger>
						<TabsTrigger value="profile">Profile</TabsTrigger>
						<TabsTrigger value="password">Update Password</TabsTrigger>
						<TabsTrigger value="api">API</TabsTrigger>
					</TabsList>

					<TabsContent value="profile">
						<ProfileForm />
					</TabsContent>

					<TabsContent value="password">
						<ProfilePasswordForm />
					</TabsContent>

					<TabsContent value="api">
						<ProfileApiTab apiKey={session.user?.api_key ?? undefined} />
					</TabsContent>

					<TabsContent value="subscription">
						<ProfileSubscriptionTab />
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
