import Dashboard from "./dashboard";

export const metadata = {
	title: "App Dashboard",
	description: "Dinherin App Dashboard",
	openGraph: {
		title: "App Dashboard",
		description: "Dinherin App Dashboard",
		url: "https://dinherin.com/dashboard",
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
		title: "App Dashboard",
		description: "Dinherin App Dashboard",
		images: ["https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"],
	},
	metadataBase: new URL("https://dinherin.com"),
	alternates: {
		canonical: "/dashboard",
	},
};

export default function DashboardPage() {
	return <Dashboard />;
}
