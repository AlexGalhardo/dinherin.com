export interface UserInterface {
	id: string;
	name: string;
	email: string;
	password?: string | null;
	stripe_some_subscription_active?: boolean | null;
	stripe_testing_subscription_finished?: boolean | null;
	stripe_testing_subscription?: boolean | null;
	stripe_customer_id?: string | null;
	stripe_hosted_invoice_url?: string | null;
	stripe_invoice_pdf?: string | null;
	stripe_testing_start_at?: string | null;
	stripe_testing_end_at?: string | null;
	stripe_subscription_start_at?: string | null;
	stripe_subscription_end_at?: string | null;
	stripe_checkout_session_id?: string | null;
	stripe_billing_portal_url?: string | null;
	stripe_canceled_subscription?: boolean | null;
	stripe_subscription_canceled_feedback?: string | null;
	stripe_subscription_canceled_reason?: string | null;
	stripe_subscription_canceled_comment?: string | null;
	stripe_subscription_cancel_at?: string | null;
	stripe_subscription_canceled_at?: string | null;
	reset_password_token?: string | null;
	reset_password_token_expires_at?: Date | null;
	subscription_active?: boolean;
	api_key: string;
	created_at: Date;
	updated_at?: Date | null;
	deleted_at?: Date | null;
}

export interface CreateUserInputInterface {
	name: string;
	email: string;
	password?: string;
}

export interface UpdateUserProfileInputInterface {
	name: string;
	email: string;
}

export interface UserWithRelations extends UserInterface {
	expenses?: any[];
	subscriptions?: any[];
	webhook_logs?: any[];
}
