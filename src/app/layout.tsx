import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/ui/Sidebar";
import TopNav from "@/components/ui/TopNav";
import SocketManager from "@/components/SocketManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WABII Smart Irrigation System",
  description: "Tablet-first IoT interface for smart agriculture and explainable AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800`}>
        <SocketManager />
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto pb-12">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
