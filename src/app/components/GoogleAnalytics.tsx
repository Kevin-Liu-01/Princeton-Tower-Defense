import Script from "next/script";

// GA4 measurement ID for www.ptd.quest; public by design (every page view sends it).
const GA_MEASUREMENT_ID = "G-GGDRMSFT6D";

// Consent Mode v2 defaults, queued before gtag.js loads: no ad storage anywhere, and no
// analytics cookies in the EEA, the UK and Switzerland (cookieless pings there).
const GA_BOOTSTRAP = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','CH','GB']});
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`;

/**
 * Google Analytics 4 on production deployments only: previews, local dev and e2e
 * runs render nothing. The async gtag.js stays out of the game loop and sends no
 * custom events; enhanced measurement counts page views, route changes included.
 */
export function GoogleAnalytics() {
  if (process.env.VERCEL_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script id="ga-consent-defaults" strategy="afterInteractive">
        {GA_BOOTSTRAP}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}
