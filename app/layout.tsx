import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import Script from "next/script";
import { GoogleAnalytics } from "@/components/google-analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Dinherin - Personal Finance Management",
	description:
		"Track your expenses, view statistics, and make smart financial decisions with our simple and intuitive platform.",
	keywords: [
		"personal finance",
		"financial control",
		"budget",
		"expenses",
		"income",
		"financial planning",
		"Dinherin",
	],
	icons: {
		icon: "https://www.favicon.cc/logo3d/11386.png",
	},
	openGraph: {
		title: "Dinherin — Easily Manage Your Personal Finances",
		description:
			"Track your expenses, view statistics, and make smart financial decisions with our simple and intuitive platform.",
		url: "https://dinherin.com",
		siteName: "Dinherin",
		images: [
			{
				url: "https://ixymyhazbhztpjnlxmbd.supabase.co/storage/v1/object/images/generated/man-checking-expenses-on-phone-24.webp",
				width: 1200,
				height: 630,
				alt: "Dinherin.com",
			},
		],
		locale: "pt_BR",
		type: "website",
	},
	metadataBase: new URL("https://dinherin.com"),
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body className={inter.className}>
				<GoogleAnalytics measurementId={process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID as string} />
				<Providers>{children}</Providers>

				<Script
					id="ms-clarity"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${process.env.MICROSOFT_CLARITY_ID}");
            `,
					}}
				/>
			</body>
		</html>
	);
}
