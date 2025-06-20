import LoginClient from "./login";

export const metadata = {
	title: "Login",
	description: "Login into your account.",
	openGraph: {
		title: "Login",
		description: "Login into your account.",
		url: "https://dinherin.com/login",
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
		title: "Login",
		description: "Login into your account.",
		images: ["https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"],
	},
	metadataBase: new URL("https://dinherin.com"),
	alternates: {
		canonical: "/login",
	},
};

export default function LoginPage() {
	return <LoginClient />;
}
