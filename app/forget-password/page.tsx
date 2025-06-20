import ForgetPasswordClient from "./forget-password";

export const metadata = {
	title: "Forget Password",
	description: "Forget your password.",
	openGraph: {
		title: "Forget Password",
		description: "Forget your password.",
		url: "https://dinherin.com/forget-password",
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
		title: "Forget Password",
		description: "Forget your password",
		images: ["https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"],
	},
	metadataBase: new URL("https://dinherin.com"),
	alternates: {
		canonical: "/forget-password",
	},
};

export default function ForgetPasswordPage() {
	return <ForgetPasswordClient />;
}
