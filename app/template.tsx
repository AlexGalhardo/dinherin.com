"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "@/components/loading-screen";

interface TemplateProps {
	children: React.ReactNode;
}

const PAGES_WITH_SEARCH_PARAMS = ["/", "/signup", "/login", "/reset-password", "/create-password", "/forget-password"];

export default function Template({ children }: TemplateProps) {
	const pathname = usePathname();

	if (PAGES_WITH_SEARCH_PARAMS.some((page) => pathname.startsWith(page))) {
		return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
	}

	return <>{children}</>;
}
