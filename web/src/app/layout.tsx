import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeRegistry } from "@/components/ui/theme-registry";
import { AuthProvider } from "@/lib/auth";
import { LocaleProvider } from "@/lib/locale";
import { Sidebar } from "@/components/ui/nav";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dreem Nest — Operations Console",
  description:
    "Unified last-mile delivery & fulfillment platform for Riyadh — work orders, tracking, DFP operations, and problem management.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${plexArabic.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <LocaleProvider>
              <AuthProvider>
                <Sidebar />
                <main className="lg:ps-60 min-h-screen bg-[#f7f5fb]">
                  {children}
                </main>
              </AuthProvider>
            </LocaleProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
