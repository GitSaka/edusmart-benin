import { useEffect } from "react";
import { syncOfflineData } from "./sync";

export function useOnlineSync() {
  useEffect(() => {
    const handleOnline = () => {
      console.log("🌍 Internet détecté → sync...");
      syncOfflineData();
    };

    window.addEventListener("online", handleOnline);

    // 🔁 test immédiat si déjà connecté
    if (navigator.onLine) {
      syncOfflineData();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}