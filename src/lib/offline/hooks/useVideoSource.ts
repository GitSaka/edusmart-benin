import { useEffect, useState } from "react";
import { dbLocal } from "@/lib/offline/db.local";

export function useVideoSource(videoId: string, url: string) {
  const [src, setSrc] = useState<string>(url);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      const file = await dbLocal.videoFiles.get(videoId);

      if (file?.blob) {
        const blobUrl = URL.createObjectURL(file.blob);
        setSrc(blobUrl);
        setIsOfflineReady(true);
      } else {
        setSrc(url);
        setIsOfflineReady(false);
      }
    };

    load();
  }, [videoId, url]);

  return { src, isOfflineReady };
}