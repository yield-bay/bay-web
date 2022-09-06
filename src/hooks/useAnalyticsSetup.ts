import { useEffect } from "react";
import * as Fathom from "fathom-client";
import { useRouter } from "next/router";

export default function useAnalyticsSetup(FATHOM_CODE: string) {
  const router = useRouter();

  useEffect(() => {
    Fathom.load(FATHOM_CODE, {
      includedDomains: ["list.yieldbay.io"],
      url: "https://sparkling-breezy.yieldbay.io/script.js",
    });

    function onRouteChangeComplete() {
      Fathom.trackPageview();
    }
    // Record a pageview when route changes
    router.events.on("routeChangeComplete", onRouteChangeComplete);

    // Unassign event listener
    return () => {
      router.events.off("routeChangeComplete", onRouteChangeComplete);
    };
  }, []);
}
