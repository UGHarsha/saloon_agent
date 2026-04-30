import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
<<<<<<< Updated upstream
=======
import AIBotButton from "./components/AIBotButton";
import Footer from "./components/Footer";
>>>>>>> Stashed changes

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Royal Glow Salon",
  description: "Experience luxury hair care and styling services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
<<<<<<< Updated upstream
      <body className={`${inter.className} bg-stone-50 text-stone-900 antialiased`} suppressHydrationWarning>
        <Navbar />
        {children}
=======
      <body className={`${inter.className} bg-stone-50 text-stone-900 antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        <div className="flex-1">
          <Navbar />
          {children}
          <AIBotButton />
        </div>
        <Footer />
>>>>>>> Stashed changes
      </body>
    </html>
  );
}
