import "./globals.css";
import { PageViewTracker } from "@/components/PageViewTracker";
import { BrandColorProvider } from "@/components/providers/BrandColorProvider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <BrandColorProvider />
          <PageViewTracker />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
