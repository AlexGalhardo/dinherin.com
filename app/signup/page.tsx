import SignupClient from "./signup";

export const metadata = {
	title: "Create your account",
	description: "Create your account.",
	openGraph: {
		title: "Create your account",
		description: "Create your account",
		url: "https://dinherin.com/signup",
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
		title: "Create your account",
		description: "Forget your password",
		images: ["https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"],
	},
	metadataBase: new URL("https://dinherin.com"),
	alternates: {
		canonical: "/signup",
	},
};

export default function SignupPage() {
	return <SignupClient />;
}
