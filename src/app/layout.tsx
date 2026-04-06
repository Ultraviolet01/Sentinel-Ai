import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  title: "Sentinel AI",
  description: "Advanced AI Agentic Audit Scorecard for Four.Meme tokens.",
  openGraph: {
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="antialiased bg-[#020617] text-white font-inter">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(168,85,247,0.05),_transparent_70%)] pointer-events-none" />
        <main className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
