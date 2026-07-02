"use client";

import { useCallback, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore";
import { useRoomDialog } from "@/hooks/websocket/useRoomDialog";

interface GuestSessionResponse {
  success: boolean;
  message?: string;
  data: { id: string; name: string; email: string };
  token: string;
  roomId: string;
}

export function useDemoSession() {
  const router = useRouter();
  const { enterDemoMode, isLoggedIn, isGuest } = useAuthStore();
  const { setOpen } = useRoomDialog();
  const [isLoading, setIsLoading] = useState(false);

  const createGuestSession = useCallback(
    async (roomId?: string) => {
      const res = await axios.post<GuestSessionResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/guest`,
        roomId ? { roomId } : {}
      );

      if (!res.data.success) {
        throw new Error(res.data.message ?? "Failed to start demo");
      }

      enterDemoMode(res.data.data, res.data.token);
      return res.data.roomId;
    },
    [enterDemoMode]
  );

  const startDemo = useCallback(
    async (options?: { openDialog?: boolean; dismissWelcome?: () => void }) => {
      if (isLoading) return;

      if (isLoggedIn && !isGuest) {
        setOpen(true);
        return;
      }

      setIsLoading(true);
      try {
        const roomId = await createGuestSession();
        options?.dismissWelcome?.();
        router.push(`/?room=${roomId}`);
        if (options?.openDialog !== false) {
          setOpen(true);
        }
        toast.success(
          "Demo started! Share the room link to collaborate in real time."
        );
      } catch (err: unknown) {
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : "Failed to start demo session";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [createGuestSession, isGuest, isLoading, isLoggedIn, router, setOpen]
  );

  const joinAsGuest = useCallback(
    async (roomId: string) => {
      const sessionRoomId = await createGuestSession(roomId);
      return sessionRoomId;
    },
    [createGuestSession]
  );

  return { startDemo, joinAsGuest, isLoading };
}
