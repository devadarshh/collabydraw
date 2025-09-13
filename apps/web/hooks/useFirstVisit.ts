import { useEffect, useState } from "react";

export function useFirstVisit(key: string) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(key);
    if (!hasSeen) {
      setIsFirstVisit(true);
    }
  }, [key]);

  const dismiss = () => {
    setIsFirstVisit(false);
    localStorage.setItem(key, "true");
  };

  return { isFirstVisit, dismiss };
}
