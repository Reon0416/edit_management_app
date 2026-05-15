"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileVideo2,
  FolderSync,
  RefreshCw,
  TimerReset
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/lib/project-store";
import { getNextAction, getNextActor, isManagerReviewStatus } from "@/lib/status";
import type { Project } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function DashboardPage() {
  const { visibleProjects: projects, currentAppUser } = useProjects();
  const active = projects.filter((project) => project.status !== "完成");
  const firstDraft = projects.filter((project) => project.status === "初稿提出済み");
  const revisions = projects.filter((project) => project.status === "修正対応中");
  const reviewWait = projects.filter((project) => isManagerReviewStatus(project.status));
  const soon = projects.filter((project) => {
    if (!project.dueDate) return false;
    const due = new Date(project.dueDate);
    const diff = due.getTime() - Date.now();
    return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 3;
  });
  const driveUpdated = projects.filter((project) => project.latestFileName);
  const needsAttention = [...reviewWait, ...soon].filter(
    (project, index, array) => array.findIndex((item) => item.id === project.id) === index
  );

  return (
    <>
      <PageHeader
        title={`${currentAppUser.name}さんのダッシュボード`}
        description={`${currentAppUser.role === "operator" ? "運営者" : "編集者"}として今日見るべき案件だけを表示しています。`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" href="/projects">
              案件一覧
            </Button>
            <Button asChild href="/projects/new">
              案件作成
            </Button>
          </div>
        }
      />

      <section className="grid-pattern mb-6 overflow-hidden rounded-lg border bg-white">
        <div className="grid gap-5 p-5 lg:grid-cols-[1.25fr_.75fr] lg:p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">本日の運用状況</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <h2 className="text-3xl font-semibold tracking-normal">確認待ち {reviewWait.length}件</h2>
              <span className="mb-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                納期3日以内 {soon.length}件
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              管理者確認待ち、修正対応中、Drive更新のある案件を優先して処理できます。
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <QuickStat label="進行中" value={active.length} icon={<Clock3 size={16} />} />
            <QuickStat label="Drive更新" value={driveUpdated.length} icon={<FolderSync size={16} />} />
            <QuickStat label="初稿確認" value={firstDraft.length} icon={<FileVideo2 size={16} />} />
            <QuickStat label="修正対応" value={revisions.length} icon={<RefreshCw size={16} />} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric title="進行中" value={`${active.length}件`} icon={<Clock3 size={18} />} />
        <Metric title="初稿確認待ち" value={`${firstDraft.length}件`} icon={<FileVideo2 size={18} />} />
        <Metric title="修正対応中" value={`${revisions.length}件`} icon={<RefreshCw size={18} />} />
        <Metric title="納期3日以内" value={`${soon.length}件`} icon={<AlertTriangle size={18} />} tone="warn" />
        <Metric title="Drive更新あり" value={`${driveUpdated.length}件`} icon={<CheckCircle2 size={18} />} tone="ok" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>優先対応</CardTitle>
            <Button asChild variant="ghost" size="sm" href="/projects">
              すべて見る
              <ArrowRight size={14} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {needsAttention.length === 0 ? (
              <EmptyState text="優先対応が必要な案件はありません。" />
            ) : (
              needsAttention.map((project) => <PriorityRow key={project.id} project={project} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近のDrive更新</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {driveUpdated.length === 0 ? (
              <EmptyState text="Drive更新のある案件はありません。" />
            ) : (
              driveUpdated.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-md border bg-white px-4 py-3 transition hover:border-primary hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{project.latestFileName}</p>
                    <TimerReset size={15} className="shrink-0 text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {project.name} / {formatDateTime(project.lastDriveSyncAt)}
                  </p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function QuickStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-white/85 p-3 shadow-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Metric({
  title,
  value,
  icon,
  tone = "normal"
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone?: "normal" | "warn" | "ok";
}) {
  const toneClass =
    tone === "warn"
      ? "bg-amber-50 text-amber-700"
      : tone === "ok"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-blue-50 text-blue-700";

  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <span className={`grid size-9 place-items-center rounded-md ${toneClass}`}>{icon}</span>
      </CardContent>
    </Card>
  );
}

function PriorityRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="grid gap-3 rounded-md border bg-white px-4 py-3 transition hover:border-primary hover:shadow-sm md:grid-cols-[1fr_auto] md:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{project.name}</p>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.manager.name} / {project.editor.name} / {getNextAction(project.status)}
        </p>
      </div>
      <div className="text-left md:text-right">
        <p className="text-sm font-medium">次: {getNextActor(project.status)}</p>
        <p className="mt-1 text-xs text-muted-foreground">納期 {formatDate(project.dueDate)}</p>
      </div>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">{text}</p>;
}
