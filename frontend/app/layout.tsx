import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inovabi · ERP Comercial",
  description: "Sistema ERP Comercial multi-tenant",
};

// Lê cookie 'theme' a cada request para aplicar o tema no <html>.
export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const theme = (await cookies()).get('theme')?.value === 'dark' ? 'dark' : 'light'

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${hankenGrotesk.variable} theme-${theme} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
