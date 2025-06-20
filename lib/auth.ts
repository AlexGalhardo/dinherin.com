import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { verifyCredentials, createUser, getUserByEmailCached } from "@/lib/services/user-service";
import { AuthOptions } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			stripe_billing_portal_url?: string | null;
			stripe_hosted_invoice_url?: string | null;
			stripe_testing_subscription?: boolean | null;
			stripe_customer_id?: string | null;
			stripe_testing_start_at?: string | null;
			stripe_testing_end_at?: string | null;
			stripe_subscription_start_at?: string | null;
			stripe_subscription_end_at?: string | null;
			api_key?: string | null;
			stripe_testing_subscription_finished?: boolean | null;
			stripe_some_subscription_active?: boolean | null;
			stripe_subscription_cancel_at?: string | null;
			stripe_subscription_canceled_comment?: string | null;
			stripe_canceled_subscription?: boolean | null;
		};
	}

	interface User {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
		stripe_billing_portal_url?: string | null;
		stripe_hosted_invoice_url?: string | null;
		stripe_testing_subscription?: boolean | null;
		stripe_customer_id?: string | null;
		stripe_testing_start_at?: string | null;
		stripe_testing_end_at?: string | null;
		stripe_subscription_start_at?: string | null;
		stripe_subscription_end_at?: string | null;
		api_key?: string | null;
		stripe_testing_subscription_finished?: boolean | null;
		stripe_some_subscription_active?: boolean | null;
		stripe_subscription_cancel_at?: string | null;
		stripe_subscription_canceled_comment?: string | null;
		stripe_canceled_subscription?: boolean | null;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		stripe_billing_portal_url?: string | null;
		stripe_hosted_invoice_url?: string | null;
		stripe_testing_subscription?: boolean | null;
		stripe_customer_id?: string | null;
		stripe_testing_start_at?: string | null;
		stripe_testing_end_at?: string | null;
		stripe_subscription_start_at?: string | null;
		stripe_subscription_end_at?: string | null;
		api_key?: string | null;
		stripe_testing_subscription_finished?: boolean | null;
		stripe_some_subscription_active?: boolean | null;
		stripe_subscription_cancel_at?: string | null;
		stripe_subscription_canceled_comment?: string | null;
		stripe_canceled_subscription?: boolean | null;
	}
}

export const authOptions: AuthOptions = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),
		Credentials({
			name: "credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "your@email.com",
				},
				password: {
					label: "Password",
					type: "password",
					placeholder: "Your password",
				},
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email and password are required");
				}

				try {
					const user = await verifyCredentials(credentials.email as string, credentials.password as string);

					if (user && user.id && !user.deleted_at) {
						return {
							id: user.id,
							name: user.name,
							email: user.email,
							image: null,
							stripe_billing_portal_url: user.stripe_billing_portal_url,
							stripe_hosted_invoice_url: user.stripe_hosted_invoice_url,
							stripe_testing_subscription: user.stripe_testing_subscription,
							stripe_customer_id: user.stripe_customer_id,
							stripe_testing_start_at: user.stripe_testing_start_at,
							stripe_testing_end_at: user.stripe_testing_end_at,
							stripe_subscription_start_at: user.stripe_subscription_start_at,
							stripe_subscription_end_at: user.stripe_subscription_end_at,
							api_key: user.api_key,
							stripe_testing_subscription_finished: user.stripe_testing_subscription_finished,
							stripe_some_subscription_active: user.stripe_some_subscription_active,
							stripe_subscription_cancel_at: user.stripe_subscription_cancel_at,
							stripe_subscription_canceled_comment: user.stripe_subscription_canceled_comment,
							stripe_canceled_subscription: user.stripe_canceled_subscription,
						};
					}

					throw new Error("Invalid credentials");
				} catch (error) {
					if (error instanceof Error) {
						if (error.message === "no_password") {
							throw new Error(
								"This account was created with Google. Please sign in with Google and set up a password.",
							);
						}
						throw error;
					}
					throw new Error("Authentication failed");
				}
			},
		}),
	],
	pages: {
		signIn: "/login",
		signOut: "/login",
		error: "/login",
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === "google") {
				return true;
			}

			if (account?.provider === "credentials") {
				return true;
			}

			return false;
		},

		async jwt({ token, user, account, profile, trigger, session }) {
			if (user) {
				token.id = user.id;
				token.stripe_billing_portal_url = user.stripe_billing_portal_url;
				token.stripe_hosted_invoice_url = user.stripe_hosted_invoice_url;
				token.stripe_testing_subscription = user.stripe_testing_subscription;
				token.stripe_customer_id = user.stripe_customer_id;
				token.stripe_testing_start_at = user.stripe_testing_start_at;
				token.stripe_testing_end_at = user.stripe_testing_end_at;
				token.stripe_subscription_start_at = user.stripe_subscription_start_at;
				token.stripe_subscription_end_at = user.stripe_subscription_end_at;
				token.api_key = user.api_key;
				token.stripe_testing_subscription_finished = user.stripe_testing_subscription_finished;
				token.stripe_some_subscription_active = user.stripe_some_subscription_active;
				token.stripe_subscription_cancel_at = user.stripe_subscription_cancel_at;
				token.stripe_subscription_canceled_comment = user.stripe_subscription_canceled_comment;
				token.stripe_canceled_subscription = user.stripe_canceled_subscription;
			}

			if (account?.provider === "google" && token.email) {
				try {
					let dbUser = await getUserByEmailCached(token.email as string);

					if (!dbUser) {
						dbUser = await createUser({
							name: token.name as string,
							email: token.email as string,
						});
					}

					token.id = dbUser.id;
					token.name = dbUser.name;
					token.email = dbUser.email;
					token.stripe_billing_portal_url = dbUser.stripe_billing_portal_url;
					token.stripe_hosted_invoice_url = dbUser.stripe_hosted_invoice_url;
					token.stripe_testing_subscription = dbUser.stripe_testing_subscription;
					token.stripe_customer_id = dbUser.stripe_customer_id;
					token.stripe_testing_start_at = dbUser.stripe_testing_start_at;
					token.stripe_testing_end_at = dbUser.stripe_testing_end_at;
					token.stripe_subscription_start_at = dbUser.stripe_subscription_start_at;
					token.stripe_subscription_end_at = dbUser.stripe_subscription_end_at;
					token.api_key = dbUser.api_key;
					token.stripe_testing_subscription_finished = dbUser.stripe_testing_subscription_finished;
					token.stripe_some_subscription_active = dbUser.stripe_some_subscription_active;
					token.stripe_subscription_cancel_at = dbUser.stripe_subscription_cancel_at;
					token.stripe_subscription_canceled_comment = dbUser.stripe_subscription_canceled_comment;
					token.stripe_canceled_subscription = dbUser.stripe_canceled_subscription;
				} catch (error) {
					console.error("Google OAuth error:", error);
					throw new Error("Failed to create or retrieve user account");
				}
			}

			if (trigger === "update" && session) {
				if (token.email) {
					try {
						const dbUser = await getUserByEmailCached(token.email as string);
						if (dbUser && !dbUser.deleted_at) {
							token.id = dbUser.id;
							token.name = dbUser.name;
							token.email = dbUser.email;
							token.stripe_billing_portal_url = dbUser.stripe_billing_portal_url;
							token.stripe_hosted_invoice_url = dbUser.stripe_hosted_invoice_url;
							token.stripe_testing_subscription = dbUser.stripe_testing_subscription;
							token.stripe_customer_id = dbUser.stripe_customer_id;
							token.stripe_testing_start_at = dbUser.stripe_testing_start_at;
							token.stripe_testing_end_at = dbUser.stripe_testing_end_at;
							token.stripe_subscription_start_at = dbUser.stripe_subscription_start_at;
							token.stripe_subscription_end_at = dbUser.stripe_subscription_end_at;
							token.api_key = dbUser.api_key;
							token.stripe_testing_subscription_finished = dbUser.stripe_testing_subscription_finished;
							token.stripe_some_subscription_active = dbUser.stripe_some_subscription_active;
							token.stripe_subscription_cancel_at = dbUser.stripe_subscription_cancel_at;
							token.stripe_subscription_canceled_comment = dbUser.stripe_subscription_canceled_comment;
							token.stripe_canceled_subscription = dbUser.stripe_canceled_subscription;
						}
					} catch (error) {
						console.error("Error refreshing user data:", error);
					}
				}
			}

			return token;
		},

		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.stripe_billing_portal_url = token.stripe_billing_portal_url;
				session.user.stripe_hosted_invoice_url = token.stripe_hosted_invoice_url;
				session.user.stripe_testing_subscription = token.stripe_testing_subscription;
				session.user.stripe_customer_id = token.stripe_customer_id;
				session.user.stripe_testing_start_at = token.stripe_testing_start_at;
				session.user.stripe_testing_end_at = token.stripe_testing_end_at;
				session.user.stripe_subscription_start_at = token.stripe_subscription_start_at;
				session.user.stripe_subscription_end_at = token.stripe_subscription_end_at;
				session.user.api_key = token.api_key;
				session.user.stripe_testing_subscription_finished = token.stripe_testing_subscription_finished;
				session.user.stripe_some_subscription_active = token.stripe_some_subscription_active;
				session.user.stripe_subscription_cancel_at = token.stripe_subscription_cancel_at;
				session.user.stripe_subscription_canceled_comment = token.stripe_subscription_canceled_comment;
				session.user.stripe_canceled_subscription = token.stripe_canceled_subscription;
			}

			console.log("session -> ", session);

			return session;
		},

		async redirect({ url, baseUrl }) {
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			else if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
	},
	debug: process.env.NODE_ENV === "development",
};
