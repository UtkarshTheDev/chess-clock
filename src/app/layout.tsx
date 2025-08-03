import type { Metadata } from "next";
import "./globals.css";
import { Ubuntu, Ubuntu_Condensed, Unbounded } from "next/font/google";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
  display: 'swap',
});

const ubuntuCondensed = Ubuntu_Condensed({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ubuntu-condensed",
  display: 'swap',
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-unbounded",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Chess Timer",
  description: "A Great Clock for Chess Players with Chess Timer and a great UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ubuntu.variable} ${ubuntuCondensed.variable} ${unbounded.variable} m-0 p-0`}>
        {children}
      </body>
    </html>
  );
}
