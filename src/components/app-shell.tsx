"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderKanban, Menu, PlusCircle, Settings, Sparkles, Users, X } from "lucide-react";
import { useState } from "react";
import { ProjectStoreProvider } from "@/lib/project-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: BarChart3 },
  { href: "/projects", label: "案件一覧", icon: FolderKanban },
  { href: "/projects/new", label: "案件作成", icon: PlusCircle },
  { href: "/people", label: "担当者別", icon: Users },
  { href: "/settings", label: "設定", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <ProjectStoreProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/95 px-4 backdrop-blur lg:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles size={16} />
            </span>
            EditFlow
          </Link>
          <button className="focus-ring rounded-md p-2" type="button" onClick={() => setOpen((value) => !value)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r bg-white/95 p-4 shadow-xl shadow-slate-200/50 backdrop-blur transition lg:translate-x-0 lg:shadow-none",
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="mb-7 rounded-lg border bg-slate-950 p-3 text-white">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-md bg-white/12">
                <Sparkles size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold">EditFlow Manager</span>
                <span className="text-xs text-slate-300">動画編集案件管理</span>
              </span>
            </Link>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                    active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-4 left-4 right-4 rounded-lg border bg-muted/60 p-3">
            <p className="text-xs font-medium text-foreground">今日の確認</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">確認待ち、納期、最新ファイルを優先して処理します。</p>
          </div>
        </aside>

        {open ? <button aria-label="メニューを閉じる" className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setOpen(false)} /> : null}

        <main className="mx-auto max-w-[1480px] px-4 py-6 lg:ml-64 lg:px-8">{children}</main>
      </div>
    </ProjectStoreProvider>
  );
}
