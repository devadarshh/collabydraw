import { useEffect, useState } from "react";

export function useFirstVisit(key: string) {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);

  useEffect(() => {
    if (!key) return;
    const hasSeen = localStorage.getItem(key);
    if (!hasSeen) {
      setIsFirstVisit(true);
    }
  }, [key]);

  const dismiss = (): void => {
    setIsFirstVisit(false);
    localStorage.setItem(key, "true");
  };

  return { isFirstVisit, dismiss };
}
