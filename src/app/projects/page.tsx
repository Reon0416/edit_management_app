"use client";

import Link from "next/link";
import { CalendarDays, ExternalLink, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { useProjects } from "@/lib/project-store";
import { getNextAction, getNextActor, PROJECT_STATUSES } from "@/lib/status";
import type { ProjectStatus } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function ProjectsPage() {
  const { visibleProjects: projects, members, currentAppUser, syncProjectWithMockDrive } = useProjects();
  const isEditor = currentAppUser.role === "editor";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [managerId, setManagerId] = useState("all");
  const [editorId, setEditorId] = useState("all");
  const [sort, setSort] = useState("updated");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...projects]
      .filter((project) => {
        const keywordMatch =
          !normalized ||
          [project.name, project.clientName, project.manager.name, project.editor.name, project.latestFileName]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(normalized));
        return (
          keywordMatch &&
          (status === "all" || project.status === status) &&
          (managerId === "all" || project.manager.id === managerId) &&
          (editorId === "all" || project.editor.id === editorId)
        );
      })
      .sort((a, b) => {
        if (sort === "due") return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [editorId, managerId, projects, query, sort, status]);

  return (
    <>
      <PageHeader
        title={isEditor ? `${currentAppUser.name}さんの担当案件` : `${currentAppUser.name}さんの案件一覧`}
        description={
          isEditor
            ? `${filtered.length}件を表示中。自分が編集者または進行担当として関わる案件だけを表示しています。`
            : `${filtered.length}件を表示中。運営者として紐づく案件だけを表示しています。`
        }
        action={
          !isEditor ? (
            <Button asChild href="/projects/new">
              案件作成
            </Button>
          ) : null
        }
      />

      {isEditor ? (
        <>
          <section className="mb-4 grid gap-3 md:grid-cols-3">
            <Summary label="関与中" value={projects.filter((project) => project.status !== "完成").length} />
            <Summary label="修正依頼" value={projects.filter((project) => project.status === "修正依頼あり").length} />
            <Summary label="完成" value={projects.filter((project) => project.status === "完成").length} />
          </section>

          <Card className="mb-4">
            <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_.7fr]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <Input
                  className="pl-9"
                  placeholder="担当案件・ファイル名で検索"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <Select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="updated">最終更新順</option>
                <option value="due">納期順</option>
              </Select>
            </CardContent>
          </Card>

          <section className="grid gap-4 xl:grid-cols-2">
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed bg-white px-4 py-12 text-center text-sm text-muted-foreground xl:col-span-2">
                条件に一致する担当案件はありません。
              </p>
            ) : (
              filtered.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="rounded-lg border bg-white p-4 shadow-sm transition hover:border-primary hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{project.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{project.clientName ?? "クライアント未設定"}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md bg-muted/60 px-3 py-2">
                      <p className="text-xs text-muted-foreground">次の作業</p>
                      <p className="mt-1 text-sm font-medium">{getNextAction(project.status)}</p>
                    </div>
                    <div className="rounded-md bg-muted/60 px-3 py-2">
                      <p className="text-xs text-muted-foreground">納期</p>
                      <p className="mt-1 text-sm font-medium">{formatDate(project.dueDate)}</p>
                    </div>
                  </div>
                  <p className="mt-3 truncate text-xs text-muted-foreground">最新ファイル: {project.latestFileName ?? "-"}</p>
                </Link>
              ))
            )}
          </section>
        </>
      ) : (
        <>

      <section className="mb-4 grid gap-3 md:grid-cols-4">
        <Summary label="全案件" value={projects.length} />
        <Summary label="管理者確認" value={projects.filter((project) => project.status === "初稿提出済み" || project.status === "再提出済み").length} />
        <Summary label="修正対応" value={projects.filter((project) => project.status === "修正対応中").length} />
        <Summary label="完成" value={projects.filter((project) => project.status === "完成").length} />
      </section>

      <Card className="mb-4">
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_.8fr_.8fr_.8fr_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-muted-foreground" size={16} />
              <Input
                className="pl-9"
                placeholder="案件名・担当者・ファイル名で検索"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <Select value={managerId} onChange={(event) => setManagerId(event.target.value)}>
              <option value="all">すべての管理者</option>
              {members
                .filter((member) => member.role !== "editor")
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </Select>
            <Select value={editorId} onChange={(event) => setEditorId(event.target.value)}>
              <option value="all">すべての編集者</option>
              {members
                .filter((member) => member.role !== "manager")
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </Select>
            <Select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="updated">最終更新順</option>
              <option value="due">納期順</option>
            </Select>
            <Button variant="outline" type="button">
              <SlidersHorizontal size={16} />
              絞り込み
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <StatusFilter active={status === "all"} onClick={() => setStatus("all")} label="すべて" count={projects.length} />
            {PROJECT_STATUSES.map((item) => (
              <StatusFilter
                key={item}
                active={status === item}
                onClick={() => setStatus(item)}
                label={item}
                count={projects.filter((project) => project.status === item).length}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm shadow-slate-200/60">
        <div className="hidden grid-cols-[1.35fr_.78fr_.72fr_.72fr_.9fr_.9fr_.75fr_.62fr] gap-3 border-b bg-slate-50 px-4 py-3 text-xs font-medium text-muted-foreground lg:grid">
          <span>案件</span>
          <span>担当</span>
          <span>ステータス</span>
          <span>次に動く人</span>
          <span>次の行動</span>
          <span>最新ファイル</span>
          <span>納期</span>
          <span>操作</span>
        </div>
        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">条件に一致する案件はありません。</p>
        ) : (
          filtered.map((project) => (
            <div
              key={project.id}
              className="grid gap-3 border-b px-4 py-4 last:border-b-0 hover:bg-slate-50/70 lg:grid-cols-[1.35fr_.78fr_.72fr_.72fr_.9fr_.9fr_.75fr_.62fr] lg:items-center"
            >
              <div className="min-w-0">
                <Link href={`/projects/${project.id}`} className="font-medium hover:text-primary">
                  {project.name}
                </Link>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {project.clientName ?? "クライアント未設定"} / 更新 {formatDateTime(project.updatedAt)}
                </p>
              </div>
              <div className="text-sm">
                <p>{project.manager.name}</p>
                <p className="text-xs text-muted-foreground">{project.editor.name}</p>
              </div>
              <StatusBadge status={project.status} />
              <span className="text-sm font-medium">{getNextActor(project.status)}</span>
              <span className="text-sm text-muted-foreground">{getNextAction(project.status)}</span>
              <span className="truncate text-sm text-muted-foreground">{project.latestFileName ?? "-"}</span>
              <span className="inline-flex items-center gap-1 text-sm">
                <CalendarDays size={14} className="text-muted-foreground" />
                {formatDate(project.dueDate)}
              </span>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Button asChild variant="outline" size="sm" href={`/projects/${project.id}`}>
                  詳細
                </Button>
                <Button variant="outline" size="icon" onClick={() => syncProjectWithMockDrive(project.id)} aria-label="Drive同期">
                  <RefreshCw size={15} />
                </Button>
                <Button asChild variant="ghost" size="icon" href={project.driveFolderUrl} target="_blank" aria-label="Driveを開く">
                  <ExternalLink size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
        </>
      )}
    </>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm shadow-slate-200/60">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusFilter({
  active,
  onClick,
  label,
  count
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
        active ? "border-primary bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {label}
      <span className="ml-2 text-xs opacity-80">{count}</span>
    </button>
  );
}
