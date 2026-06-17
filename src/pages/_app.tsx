import type { AppProps } from "next/app";
import MainLayout from "@/layouts/MainLayout";
import { ThemeProvider } from "@/app/theme/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </ThemeProvider>
  );
}
