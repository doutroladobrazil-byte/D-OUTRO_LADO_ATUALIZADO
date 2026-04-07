import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocaleProvider } from "@/contexts/LocaleContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "D'OUTRO LADO",
  description: "Premium international platform for home, decor, fashion and leather goods — D'OUTRO LADO.",
  openGraph: {
    type: "website",
    siteName: "D'OUTRO LADO",
    locale: "pt_BR",
    alternateLocale: ["en_US"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /**
     * lang="pt-BR" reflects the primary platform language.
     * The LocaleProvider handles display currency/language per user preference.
     * For future i18n-router (e.g. /en/ prefix routes), replace with [lang] param.
     */
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <AuthProvider>
          <LocaleProvider>
            <AppShell>{children}</AppShell>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
