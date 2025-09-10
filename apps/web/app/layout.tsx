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
