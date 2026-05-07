import { dbLocal } from "./db.local";

/**
 * 🚀 SYNC OFFLINE → ONLINE
 */
export const syncOfflineData = async () => {
  if (!navigator.onLine) return;

  const queue = await dbLocal.syncQueue.toArray();
  if (queue.length === 0) return;

  console.log(`🔄 Sync started: ${queue.length} items`);

  for (const item of queue) {
    try {
      const success = await handleSyncItem(item);

      if (!success) continue;

      await dbLocal.syncQueue.delete(item.id!);
      console.log("✔ Synced:", item.type);

    } catch (error) {
      console.log("❌ Sync error:", item.type, error);
    }
  }

  console.log("✅ Sync finished");
};

/**
 * 🧠 ROUTEUR CENTRAL
 */
async function handleSyncItem(item: any): Promise<boolean> {
  switch (item.type) {
    case "CREATE_NOTE":
      return await syncRequest("/api/notes/sync", "POST", item.payload);

    case "CREATE_SCHEDULE":
      return await syncRequest("/api/schedule/sync", "POST", item.payload);

    case "UPDATE_NOTE":
      return await syncRequest(`/api/notes/${item.payload.id}`, "PUT", item.payload);

    default:
      console.warn("Unknown sync type:", item.type);
      return false;
  }
}

/**
 * 🌐 WRAPPER FETCH SAFE
 */
async function syncRequest(url: string, method: string, payload: any): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.log("❌ API rejected:", url);
      return false;
    }

    return true;
  } catch (err) {
    console.log("⚠️ Network error:", url, err);
    return false;
  }
}