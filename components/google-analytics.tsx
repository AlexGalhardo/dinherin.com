"use client";

import Script from "next/script";

interface GoogleAnalyticsProps {
	measurementId: string;
}

declare global {
	interface Window {
		gtag: (...args: any[]) => void;
		dataLayer: any[];
	}
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
	return (
		<>
			<Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
			<Script
				id="google-analytics"
				strategy="afterInteractive"
				dangerouslySetInnerHTML={{
					__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_location: window.location.href,
              page_title: document.title,
            });
            
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            
            history.pushState = function() {
              originalPushState.apply(history, arguments);
              setTimeout(() => {
                gtag('config', '${measurementId}', {
                  page_location: window.location.href,
                  page_title: document.title,
                });
              }, 100);
            };
            
            history.replaceState = function() {
              originalReplaceState.apply(history, arguments);
              setTimeout(() => {
                gtag('config', '${measurementId}', {
                  page_location: window.location.href,
                  page_title: document.title,
                });
              }, 100);
            };
          `,
				}}
			/>
		</>
	);
}
