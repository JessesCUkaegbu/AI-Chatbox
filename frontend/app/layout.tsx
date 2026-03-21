import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/AppHeader";

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Jess Chat",
  description: "Jess Chat Bot UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={space.variable}>
      <body className="font-sans">
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
