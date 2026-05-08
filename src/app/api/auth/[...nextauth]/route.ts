import { handlers } from "@/lib/auth"

// 🔥 important pour Vercel
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export const { GET, POST } = handlers
