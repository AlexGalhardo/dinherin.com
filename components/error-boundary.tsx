"use client";

import React from "react";

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error Boundary caught an error:", error, errorInfo);
	}

	resetError = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		if (this.state.hasError) {
			const FallbackComponent = this.props.fallback || DefaultErrorFallback;

			return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
		}

		return this.props.children;
	}
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
				<div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
					<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>

				<div className="mt-4 text-center">
					<h1 className="text-lg font-medium text-gray-900">Something went wrong</h1>
					<p className="mt-2 text-sm text-gray-600">{error.message || "An unexpected error occurred"}</p>
				</div>

				<div className="mt-6">
					<button
						onClick={resetError}
						className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Try again
					</button>
				</div>
			</div>
		</div>
	);
}
