"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FolderKanban, Menu, PlusCircle, Settings, Sparkles, UserRound, Users, X } from "lucide-react";
import { useState } from "react";
import { ProjectStoreProvider } from "@/lib/project-store";
import { useProjects } from "@/lib/project-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: BarChart3, roles: ["operator"] },
  { href: "/projects", label: "案件一覧", icon: FolderKanban, roles: ["operator"] },
  { href: "/projects/new", label: "案件作成", icon: PlusCircle, roles: ["operator"] },
  { href: "/people", label: "担当者別", icon: Users, roles: ["operator"] },
  { href: "/settings", label: "設定", icon: Settings, roles: ["operator"] },
  { href: "/", label: "マイタスク", icon: BarChart3, roles: ["editor"] },
  { href: "/projects", label: "担当案件", icon: FolderKanban, roles: ["editor"] }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProjectStoreProvider>
      <AppShellInner>{children}</AppShellInner>
    </ProjectStoreProvider>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { appUsers, currentAppUser, setCurrentAppUserId, visibleProjects } = useProjects();

  return (
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
            {navItems
              .filter((item) => item.roles.includes(currentAppUser.role))
              .map((item) => {
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
          <div className="mt-6 rounded-lg border bg-white p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <UserRound size={14} />
              表示ユーザー
            </div>
            <select
              className="focus-ring h-9 w-full rounded-md border bg-white px-2 text-sm"
              value={currentAppUser.id}
              onChange={(event) => setCurrentAppUserId(event.target.value)}
            >
              <optgroup label="運営者">
                {appUsers
                  .filter((user) => user.role === "operator")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="編集者">
                {appUsers
                  .filter((user) => user.role === "editor")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </optgroup>
            </select>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentAppUser.role === "operator" ? "運営者画面" : "編集者画面"}</span>
              <span>{visibleProjects.length}件</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 rounded-lg border bg-muted/60 p-3">
            <p className="text-xs font-medium text-foreground">
              {currentAppUser.role === "operator" ? "今日の確認" : "今日の作業"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {currentAppUser.role === "operator"
                ? "確認待ち、納期、最新ファイルを優先して処理します。"
                : "自分に割り当てられた案件だけを表示します。"}
            </p>
          </div>
        </aside>

        {open ? <button aria-label="メニューを閉じる" className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setOpen(false)} /> : null}

        <main className="mx-auto max-w-[1480px] px-4 py-6 lg:ml-64 lg:px-8">{children}</main>
      </div>
  );
}
