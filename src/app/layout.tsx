import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./Providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap"
});

export const metadata: Metadata = {
  title: "BeatBond",
  description: "Your favorite music matcher",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={poppins.className}
      >
        <Providers>
          <Navbar/>
          {children}
        </Providers>
      </body>
    </html>
  );
}