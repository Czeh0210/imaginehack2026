import "@/styles/globals.css";
import GlobalChatWidget from "@/components/GlobalChatWidget";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <GlobalChatWidget />
    </>
  );
}
