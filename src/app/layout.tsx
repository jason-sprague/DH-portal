import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SessionProvider } from "next-auth/react"
import FirebaseMessagingSetup from "@/components/FirebaseMessagingSetup";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "DH Portal",
  description: "Client Portal for Dykstra | Hamel",
  manifest: "/manifest.json", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
  
      <body className={`${outfit.variable} ${outfit.variable}`}>
        <SessionProvider>
          <FirebaseMessagingSetup />
        {children}
        </SessionProvider>
      </body>
    </html>
  );
}
