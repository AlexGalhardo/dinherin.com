"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingScreen from "./loading-screen";

interface AuthCheckProps {
	children: React.ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
	const router = useRouter();
	const { status } = useSession();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status !== "loading") {
			setIsLoading(false);
		}
	}, [status, router]);

	if (isLoading || status === "loading") return <LoadingScreen />;

	if (status === "unauthenticated") return null;

	return <>{children}</>;
}
