import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import CreateRoomDialog from "@/components/room/CreateRoomDialog";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const excalifont = localFont({
  src: "./fonts/Excalifont.woff2",
  variable: "--font-excalifont",
  weight: "400",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Collabydraw",
    template: "%s | Collabydraw",
  },
  description:
    "Real-time collaborative whiteboard for sketching diagrams and wireframes with a hand-drawn feel.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${excalifont.variable} antialiased bg-background text-foreground transition-colors duration-300`}
      >
        <ThemeProvider
          attribute={"class"}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="bottom-right" />
          {children}
          <CreateRoomDialog />
        </ThemeProvider>
      </body>
    </html>
  );
}
