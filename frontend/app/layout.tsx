import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inovabi · ERP Comercial",
  description: "Sistema ERP Comercial multi-tenant",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = (await cookies()).get('theme')?.value === 'dark' ? 'dark' : 'light'

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} theme-${theme} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
