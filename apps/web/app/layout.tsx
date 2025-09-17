import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import CreateRoomDialog from "@/components/room/CreateRoomDialog";
import localFont from "next/font/local";

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
      { url: "/logoo.png", type: "image/png", sizes: "32x32" },
      { url: "/logoo.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: "/logoo.png",
    apple: "/logoo.png",
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Toaster position="bottom-right" />
          {children}
          <CreateRoomDialog />
        </ThemeProvider>
      </body>
    </html>
  );
}
