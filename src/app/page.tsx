import Script from 'next/script'
import AuthWrapper from "@/components/auth-wrapper";

export default function Warp() {
  return (
    <>
    <Script
      strategy="afterInteractive"
      id="gtag-script"
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_CODE}`}
    />
    <Script
      strategy="afterInteractive"
      id="gtag-script"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.GOOGLE_ANALYTICS_CODE}', {
            page_path: window.location.pathname,
          });
        `,
      }}
    />
    <AuthWrapper/>
    </>
  );
}
