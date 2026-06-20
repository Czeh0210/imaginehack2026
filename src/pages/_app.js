import "@/styles/globals.css";
import { useState } from "react";
import Script from "next/script";
import { MapsLoadedContext } from "@/lib/mapsLoader";
import GlobalChatWidget from "@/components/GlobalChatWidget";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function App({ Component, pageProps }) {
  const [mapsLoaded, setMapsLoaded] = useState(false);

  return (
    <MapsLoadedContext.Provider value={mapsLoaded}>
      {MAPS_API_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`}
          strategy="lazyOnload"
          onLoad={() => setMapsLoaded(true)}
        />
      )}
      <Component {...pageProps} />
      <GlobalChatWidget />
    </MapsLoadedContext.Provider>
  );
}
