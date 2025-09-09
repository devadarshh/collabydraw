"use client";

import { Button } from "./ui/button";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "./ui/dialog";
import { useRoomDialog } from "@/hooks/useRoomDialog";

export default function CreateRoomDialog() {
  const { open, setOpen } = useRoomDialog();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dark overlay */}
      <DialogOverlay className="bg-black/40 backdrop-blur-sm fixed inset-0 flex items-center justify-center" />

      {/* Centered responsive content */}
      <DialogContent className="w-[90%] max-w-lg mx-auto rounded-xl border border-dialog-border-color shadow-lg bg-white dark:bg-richblack-900 p-6 sm:p-8 space-y-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center font-bold text-xl sm:text-2xl text-color-primary tracking-wide">
            Live Collaboration
          </DialogTitle>
          <p className="text-center text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">
            <span className="block mb-2">
              Invite people to collaborate on your drawing in real-time.
            </span>
            Do not worry, the session is{" "}
            <span className="font-semibold text-color-primary">
              end-to-end encrypted
            </span>{" "}
            and fully private. Not even our server can see what you draw.
          </p>
        </DialogHeader>

        <div className="flex items-center justify-center">
          <Button
            type="button"
            size="lg"
            className="cursor-pointer w-full sm:w-auto py-3 px-6 min-h-12 rounded-lg text-sm font-semibold text-white shadow-md transition-transform active:scale-[.98]"
            style={{
              background: "linear-gradient(to right, #8d8bd6 0%, #8d8bd6 100%)",
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5 text-white cursor-pointer" />
              Start Session
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
