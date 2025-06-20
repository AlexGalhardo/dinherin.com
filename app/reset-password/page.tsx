import ResetPasswordClient from "./reset-password";

export const metadata = {
	title: "Reset Password",
	description: "Reset your password.",
	openGraph: {
		title: "Reset Password",
		description: "Reset your password.",
		url: "https://dinherin.com/reset-password",
		siteName: "Dinherin.com",
		images: [
			{
				url: "https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct",
				width: 1200,
				height: 630,
				alt: "RespondeAê",
			},
		],
		locale: "pt_BR",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reset Password",
		description: "Reset your password",
		images: ["https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"],
	},
	metadataBase: new URL("https://dinherin.com"),
	alternates: {
		canonical: "/reset-password",
	},
};

export default function ResetPasswordPage() {
	return <ResetPasswordClient />;
}
