"use client";

import type React from "react";
import type { Session } from "next-auth";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthSessionProvider } from "@/providers/session-provider";
import { AuthProvider } from "@/contexts/auth.context";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { Toaster } from "@/components/ui/toaster";

interface ProvidersProps {
	children: React.ReactNode;
	session?: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
	return (
		<ErrorBoundary>
			<ReactQueryProvider>
				<AuthSessionProvider session={session}>
					<AuthProvider>
						<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
							{children}
							<Toaster />
						</ThemeProvider>
					</AuthProvider>
				</AuthSessionProvider>
			</ReactQueryProvider>
		</ErrorBoundary>
	);
}
