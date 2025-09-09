import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Roboto } from "next/font/google";
import CreateRoomDialog from "@/components/CreateRoomDialog";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Collabydraw",
    template: "%s | Collabydraw",
  },
  description:
    "Real-time collaborative whiteboard for sketching diagrams and wireframes with a hand-drawn feel.",
  keywords: [
    "collaboration",
    "drawing",
    "canvas",
    "nextjs",
    "fabricjs",
    "real-time",
  ],
  authors: [{ name: "Adarsh Singh", url: "https://github.com/devadarshh" }],
  creator: "Adarsh Singh", // replace with your domain

  openGraph: {
    title: "CollabyDraw - Real-time Collaborative Drawing",
    description:
      "Real-time collaborative whiteboard for sketching diagrams and wireframes with a hand-drawn feel.",
    siteName: "CollabyDraw",
    images: [
      {
        url: "/favicon.png", 
        width: 1200,
        height: 630,
        alt: "CollabyDraw - Real-time Collaborative Drawing",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster position="bottom-right" />
          {children}
          <CreateRoomDialog />
        </ThemeProvider>
      </body>
    </html>
  );
}
