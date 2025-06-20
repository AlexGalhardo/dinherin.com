import CreatePasswordClient from "./create-password";

export const metadata = {
	title: "Create Password",
	description: "Create your password.",
	openGraph: {
		title: "Create Password",
		description: "Create your password.",
		url: "https://dinherin.com/create-password",
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
		title: "Create Password",
		description: "Create your password",
		images: ["https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"],
	},
	metadataBase: new URL("https://dinherin.com"),
	alternates: {
		canonical: "/create-password",
	},
};

export default function CreatePasswordPage() {
	return <CreatePasswordClient />;
}
