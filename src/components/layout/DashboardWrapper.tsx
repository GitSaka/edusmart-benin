"use client"; // Indispensable ici

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { UserProvider } from "@/providers/UserProvider";

export default function DashboardClientLayout({ 
  children, 
  userData 
}: { 
  children: React.ReactNode; 
  userData: any 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <UserProvider user={userData}>
      <div className="relative min-h-screen flex bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300 h-screen">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
          
          <main className="p-4 md:p-6 lg:p-10 w-full max-w-[1600px] mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}