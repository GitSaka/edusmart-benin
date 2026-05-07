"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

export default function NavButton({ href, label }: { href: string, label: string }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  return (
    <button 
      onClick={() => { setIsPending(true); router.push(href); }}
      disabled={isPending}
      className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70"
    >
      {isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
      {isPending ? "PATIENTEZ..." : label}
    </button>
  );
}
