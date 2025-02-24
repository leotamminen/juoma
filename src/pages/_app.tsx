import type { AppProps } from "next/app";
import MainLayout from "@/layouts/MainLayout";
import { ThemeProvider } from "@/app/theme/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      {/* Layout sisältää globaalit osat kuten Navbarin ja Footerin */}
      <MainLayout>
        {/* Sivun sisältö vaihtuu dynaamisesti */}
        <main>
          <Component {...pageProps} />
        </main>
      </MainLayout>
    </ThemeProvider>
  );
}
