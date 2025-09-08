"use client";

import {
  Upload,
  Download,
  Share2,
  Users,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Sun,
  Moon,
  Settings2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface InfoSidebarProps {
  className?: string;
  isLoggedIn?: boolean;
  onClearCanvas?: () => void;
}

const socialLinks = [
  { id: "github", name: "GitHub", icon: Github, url: "#" },
  { id: "twitter", name: "Twitter", icon: Twitter, url: "#" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, url: "#" },
];

export function InfoSidebar({
  className,
  isLoggedIn = false,
  onClearCanvas,
}: InfoSidebarProps) {
  const colorOptions = ["#ffffff", "#f0f0f0", "#121212", "#fef3c7", "#d1fae5"];
  const { theme, setTheme } = useTheme();

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
      <div className="space-y-4 mt-8">
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
          {!isLoggedIn && (
            <Button
              size="sm"
              className="border border-[#605ebc33] hover:bg-[#8d8bd622] cursor-pointer"
            >
              Create Account
            </Button>
          )}
          {isLoggedIn && (
            <Button
              size="sm"
              className="border border-[#605ebc33] hover:bg-[#8d8bd622] cursor-pointer"
            >
              Logout
            </Button>
          )}
        </div>

        <section>
          <SectionTitle>File Operations</SectionTitle>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-[#605ebc]" /> Import Drawing
            </button>
            <button className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all cursor-pointer">
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
                className="w-6 h-6 rounded border border-[#605ebc33] hover:border-[#605ebc55] cursor-pointer"
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-6 h-6 rounded border border-[#605ebc33] cursor-pointer"
            />
            <Input
              className="text-xs flex-1 border border-[#605ebc33]"
              placeholder="#ffffff"
            />
          </div>
        </section>

        <section>
          <SectionTitle>Sharing</SectionTitle>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 w-full py-2 px-3 text-sm rounded-lg border border-[#605ebc33] hover:bg-[#8d8bd622] transition-all cursor-pointer">
              <Users className="w-4 h-4 text-[#605ebc]" /> Live Collaboration
            </button>
            <button
              onClick={onClearCanvas}
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
