"use client";

import {
  Upload,
  Download,
  Share2,
  Users,
  Github,
  Twitter,
  Linkedin,
  Sun,
  Moon,
  Settings2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { useTheme } from "next-themes";
import { useCanvasStore } from "@/hooks/canvas/useCanvasStore";
import { useRoomDialog } from "@/hooks/websocket/useRoomDialog";
import { toast } from "sonner";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { useWsStore } from "@/hooks/websocket/useWsStore";

interface InfoSidebarProps {
  className?: string;
}

const socialLinks = [
  {
    id: "github",
    name: "GitHub",
    icon: Github,
    url: "https://github.com/devadarshh",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: Twitter,
    url: "https://x.com/imadarsh2002",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    url: "https://www.linkedin.com/in/imadarsh-singh/",
  },
];

export function InfoSidebar({ className }: InfoSidebarProps) {
  const { user, isLoggedIn, logout } = useAuthStore();
  const colorOptions = ["#ffffff", "#f0f0f0", "#121212", "#fef3c7", "#d1fae5"];
  const { theme, setTheme } = useTheme();
  const { backgroundColor, clearCanvas, setBackgroundColor } = useCanvasStore();
  const { setOpen } = useRoomDialog();

  const { ws, roomId, setWs, setRoomId, setIsConnected } = useWsStore();
  const isConnected = useWsStore((state) => state.isConnected);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  const handleCloseRoom = () => {
    if (ws && roomId) {
      ws.send(JSON.stringify({ type: "LEAVE_ROOM", roomId }));
      ws.close();

      setIsConnected(false);
      setRoomId(null);
      setWs(null);

      toast.success("Room closed successfully!");
    } else {
      toast.error("No active room to close");
    }
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xs font-semibold text-[#605ebc] uppercase tracking-wider mb-2">
      {children}
    </h3>
  );

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className={cn(
        "flex flex-col w-72 sm:w-80 h-screen bg-white dark:bg-[#1e1e1e] border-l border-[#605ebc33] p-6 justify-between",
        className
      )}
    >
      <div className="space-y-4 mt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="w-5 h-5 text-[#605ebc]" />
            <h2 className="text-lg font-semibold text-[#605ebc]">Settings</h2>
          </div>
          <p className="text-sm text-[#333] dark:text-[#ccc]">
            Manage your canvas and sharing options
          </p>
        </div>

        {/* Auth buttons / user info */}
        <div className="flex flex-col gap-2 mb-4">
          {!isLoggedIn ? (
            <div className="flex flex-col gap-2">
              <Link href="/auth/signup" passHref>
                <Button className="w-full">Create Account</Button>
              </Link>
              <Link href="/auth/signin" passHref>
                <Button
                  variant="outline"
                  className="w-full border-[#605ebc] text-[#605ebc] hover:bg-[#8d8bd622]"
                >
                  Login
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col border rounded-lg px-3 py-2 gap-2">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#605ebc]">
                  {user?.name}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                className="w-full border border-[#605ebc] text-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-900"
              >
                Logout
              </Button>
            </div>
          )}
        </div>

        <section>
          <SectionTitle>File Operations</SectionTitle>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => toast.info("Import Drawing – Coming soon 🚀")}
              className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#605ebc]" /> Import Drawing
            </button>
            <button
              onClick={() => toast.info("Export Drawing – Coming soon 🚀")}
              className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#605ebc]" /> Export Drawing
            </button>
          </div>
        </section>

        <section>
          <SectionTitle>Canvas Background</SectionTitle>
          <div className="flex gap-2 mb-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                style={{ backgroundColor: color }}
                className={cn(
                  "w-6 h-6 rounded border transition-transform duration-200 cursor-pointer hover:scale-105 hover:ring-2 hover:ring-[#605ebc] hover:ring-offset-1",
                  backgroundColor === color
                    ? "ring-2 ring-[#605ebc] ring-offset-1"
                    : "border-[#605ebc33]"
                )}
                onClick={() => setBackgroundColor(color)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-6 h-6 rounded border border-[#605ebc33] cursor-pointer"
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
            <Input
              className="text-xs flex-1 border border-[#605ebc33]"
              placeholder="#ffffff"
              onBlur={(e) => setBackgroundColor(e.target.value)}
            />
          </div>
        </section>

        <section>
          <SectionTitle>Sharing</SectionTitle>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#605ebc]" /> Live Collaboration
            </button>

            <button
              onClick={() => clearCanvas()}
              className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-red-500 text-red-500 hover:bg-red-100 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-500" /> Clear Canvas
            </button>
          </div>
        </section>

        <section>
          <SectionTitle>Appearance</SectionTitle>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#605ebc]" />
            ) : (
              <Moon className="w-4 h-4 text-[#605ebc]" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </section>

        <section>
          <SectionTitle>Connect With Me</SectionTitle>
          <div className="flex flex-col gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all text-[#111] dark:text-[#eee] cursor-pointer"
              >
                <social.icon className="w-4 h-4 text-[#605ebc]" />
                {social.name}
                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 text-[#605ebc]" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
