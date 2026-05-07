"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { syncOfflineData } from "@/lib/offline/sync";

type OfflineContextType = {
  isOnline: boolean;
};

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
});

export const useOffline = () => useContext(OfflineContext);

export default function OfflineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);

      // 🔥 SYNC UNIQUE POINT
      syncOfflineData();
    };

    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline }}>
      {children}
    </OfflineContext.Provider>
  );
}