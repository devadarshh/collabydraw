"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  Download,
  Users,
  Github,
  Twitter,
  Linkedin,
  Sun,
  Moon,
  Settings2,
  ExternalLink,
  Trash2,
  LogOut,
  Circle,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useTheme } from "next-themes";
import { useCanvasStore } from "@/hooks/canvas/useCanvasStore";
import { useRoomDialog } from "@/hooks/websocket/useRoomDialog";
import { useAuthStore } from "@/hooks/auth/useAuthStore";
import { useDemoSession } from "@/hooks/auth/useDemoSession";
import { useWsStore } from "@/hooks/websocket/useWsStore";
import { useLeaveRoom } from "@/hooks/websocket/useRoomSession";
import { toast } from "sonner";

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

export const InfoSidebar: React.FC<InfoSidebarProps> = ({ className }) => {
  const { user, isLoggedIn, isGuest, logout } = useAuthStore();
  const { startDemo, isLoading: isDemoLoading } = useDemoSession();
  const { theme, setTheme } = useTheme();
  const {
    canvas,
    backgroundColor,
    setBackgroundColor,
    clearCanvas,
    exportDrawing,
    importDrawing,
  } = useCanvasStore();
  const { setOpen } = useRoomDialog();
  const { roomId, isConnected, participants } = useWsStore();
  const { leaveRoom } = useLeaveRoom();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [hexInput, setHexInput] = useState(backgroundColor);
  const pendingFileRef = useRef<File | null>(null);

  const colorOptions = ["#ffffff", "#f0f0f0", "#121212", "#fef3c7", "#d1fae5"];

  useEffect(() => {
    setHexInput(backgroundColor);
  }, [backgroundColor]);

  const handleLogout = () => {
    if (isConnected) {
      leaveRoom();
    }
    logout();
    if (!isConnected) {
      toast.success(isGuest ? "Demo ended" : "Logged out successfully!");
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleImportClick = () => {
    if (isConnected) {
      toast.error("Leave the live session before importing a drawing.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const hasExistingContent = (canvas?.getObjects().length ?? 0) > 0;
    if (hasExistingContent) {
      pendingFileRef.current = file;
      setImportDialogOpen(true);
      return;
    }

    await importDrawing(file);
  };

  const confirmImport = async () => {
    if (pendingFileRef.current) {
      await importDrawing(pendingFileRef.current);
      pendingFileRef.current = null;
    }
    setImportDialogOpen(false);
  };

  const cancelImport = () => {
    pendingFileRef.current = null;
    setImportDialogOpen(false);
  };

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <h3 className="text-xs font-semibold text-[#605ebc] uppercase tracking-wider mb-2">
      {children}
    </h3>
  );

  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 w-72 sm:w-80 bg-white dark:bg-[#1e1e1e] border-l border-[#605ebc33] text-[#111] dark:text-[#eee]",
        className
      )}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-4 overscroll-contain">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="w-5 h-5 text-[#605ebc]" />
            <h2 className="text-lg font-semibold text-[#605ebc]">Settings</h2>
          </div>
          <p className="text-sm text-[#333] dark:text-[#ccc]">
            Manage your canvas and sharing options
          </p>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {isGuest ? (
            <div className="flex flex-col border rounded-lg px-3 py-2 gap-2 border-[#8d8bd6] bg-[#8d8bd611]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#605ebc]" />
                <span className="text-sm font-semibold text-[#605ebc]">
                  Demo Mode
                </span>
              </div>
              <span className="text-sm text-[#333] dark:text-[#ccc]">
                {user?.name}
              </span>
              <p className="text-xs text-[#666] dark:text-[#aaa]">
                Create an account to save your work permanently.
              </p>
              <Link href="/auth/signup" passHref>
                <Button className="w-full cursor-pointer">Create Account</Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-[#605ebc] text-[#605ebc] hover:bg-[#8d8bd622] cursor-pointer"
              >
                Exit Demo
              </Button>
            </div>
          ) : !isLoggedIn ? (
            <>
              <Button
                onClick={() => startDemo()}
                disabled={isDemoLoading}
                className="w-full cursor-pointer bg-[#8d8bd6] hover:bg-[#7a78c4] text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isDemoLoading ? "Starting demo..." : "Try Demo"}
              </Button>
              <Link href="/auth/signup" passHref>
                <Button className="w-full cursor-pointer">
                  Create Account
                </Button>
              </Link>
              <Link href="/auth/signin" passHref>
                <Button
                  variant="outline"
                  className="w-full border-[#605ebc] text-[#605ebc] hover:bg-[#8d8bd622] cursor-pointer"
                >
                  Login
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex flex-col border rounded-lg px-3 py-2 gap-2">
              <span className="text-sm font-semibold text-[#605ebc]">
                {user?.name}
              </span>
              <span className="text-xs text-[#666] dark:text-[#aaa] truncate">
                {user?.email}
              </span>
              <Button
                onClick={handleLogout}
                className="w-full border border-[#605ebc] text-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer"
              >
                Logout
              </Button>
            </div>
          )}
        </div>

        {isConnected && roomId && (
          <section className="border rounded-lg px-3 py-3 bg-[#8d8bd611] dark:bg-[#605ebc22]">
            <SectionTitle>Live Session</SectionTitle>
            <p className="text-xs text-[#555] dark:text-[#bbb] mb-2 truncate">
              Room: {roomId}
            </p>
            <p className="text-sm font-medium text-[#605ebc] mb-2">
              {participants.length}{" "}
              {participants.length === 1 ? "user" : "users"} online
            </p>
            <ul className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
              {participants.map((participant) => (
                <li
                  key={participant.userId}
                  className="flex items-center gap-2 text-sm text-[#333] dark:text-[#ddd]"
                >
                  <Circle
                    className="w-2 h-2 fill-green-500 text-green-500 shrink-0"
                    aria-hidden
                  />
                  <span className="truncate">
                    {participant.userName}
                    {participant.userId === user?.id ? " (you)" : ""}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              onClick={leaveRoom}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
          </section>
        )}

        <section>
          <SectionTitle>File Operations</SectionTitle>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#605ebc]" />
              Import Drawing
            </button>
            <button
              onClick={exportDrawing}
              className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#605ebc]" />
              Export Drawing
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
              value={backgroundColor}
              className="w-6 h-6 rounded border border-[#605ebc33] cursor-pointer"
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
            <Input
              className="text-xs flex-1 border border-[#605ebc33]"
              placeholder="#ffffff"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={() => setBackgroundColor(hexInput)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setBackgroundColor(hexInput);
                }
              }}
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
              <Users className="w-4 h-4 text-[#605ebc]" />
              Live Collaboration
            </button>
            <button
              onClick={clearCanvas}
              className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-red-500 text-red-500 hover:bg-red-100 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              Clear Canvas
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

      <AlertDialog
        open={importDialogOpen}
        onOpenChange={(open) => {
          setImportDialogOpen(open);
          if (!open) pendingFileRef.current = null;
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace current drawing?</AlertDialogTitle>
            <AlertDialogDescription>
              Importing will replace everything on the canvas. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelImport}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
