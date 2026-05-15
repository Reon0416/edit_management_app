"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSpreadsheet,
  FileVideo2,
  Folder,
  History,
  RefreshCw,
  Send,
  UserRound
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useProjects } from "@/lib/project-store";
import { getNextAction, getNextActor, getNextStatusCandidates, PROJECT_STATUSES } from "@/lib/status";
import type { HistoryType, ProjectStatus } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { visibleProjects, updateProjectStatus, addHistory, syncProjectWithMockDrive } = useProjects();
  const project = visibleProjects.find((item) => item.id === params.id);
  const [historyType, setHistoryType] = useState<HistoryType>("メモ");
  const [historyContent, setHistoryContent] = useState("");
  const [historyFileUrl, setHistoryFileUrl] = useState("");
  const [historyFilter, setHistoryFilter] = useState<HistoryType | "all" | "work">("work");
  const [showAllHistories, setShowAllHistories] = useState(false);

  if (!project) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">案件が見つかりません。</p>
          <Button asChild className="mt-4" href="/projects">
            案件一覧へ
          </Button>
        </CardContent>
      </Card>
    );
  }

  function submitHistory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!historyContent.trim() && !historyFileUrl.trim()) return;
    addHistory(project!.id, historyType, historyContent, historyFileUrl);
    setHistoryContent("");
    setHistoryFileUrl("");
  }

  const nextCandidates = getNextStatusCandidates(project.status);
  const filteredHistories = project.histories.filter((history) => {
    if (historyFilter === "all") return true;
    if (historyFilter === "work") return history.type !== "Drive同期" && history.type !== "ステータス変更";
    return history.type === historyFilter;
  });
  const visibleHistories = showAllHistories ? filteredHistories : filteredHistories.slice(0, 3);
  const hiddenHistoryCount = Math.max(filteredHistories.length - visibleHistories.length, 0);

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${project.clientName ?? "クライアント未設定"} / 管理者 ${project.manager.name} / 編集者 ${project.editor.name}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => syncProjectWithMockDrive(project.id)}>
              <RefreshCw size={16} />
              Drive同期
            </Button>
            <Button asChild href={project.driveFolderUrl} target="_blank">
              <ExternalLink size={16} />
              案件フォルダ
            </Button>
          </div>
        }
      />

      <section className="mb-6 overflow-hidden rounded-lg border bg-white shadow-sm shadow-slate-200/60">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={project.status} />
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                <UserRound size={14} />
                次に動く人: {getNextActor(project.status)}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-normal">{getNextAction(project.status)}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              最新ファイル: {project.latestFileName ?? "-"} / 最終Drive同期: {formatDateTime(project.lastDriveSyncAt)}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
            <Info icon={<Clock3 size={16} />} label="納期" value={formatDate(project.dueDate)} />
            <Info icon={<History size={16} />} label="最終更新" value={formatDateTime(project.updatedAt)} />
            <Info icon={<CheckCircle2 size={16} />} label="履歴" value={`${project.histories.length}件`} />
          </div>
        </div>
        <div className="border-t bg-slate-50 px-5 py-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {nextCandidates.length > 0 ? (
              nextCandidates.map((status) => (
                <Button key={status} variant="outline" size="sm" onClick={() => updateProjectStatus(project.id, status)}>
                  {status}にする
                </Button>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">次のステータス候補はありません。</span>
            )}
            <Select
              className="max-w-48"
              value={project.status}
              onChange={(event) => updateProjectStatus(project.id, event.target.value as ProjectStatus)}
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Driveリンク</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <DriveTile icon={<Folder size={18} />} label="案件フォルダ" href={project.driveFolderUrl} />
              <DriveTile icon={<FileSpreadsheet size={18} />} label="台本" href={project.scriptUrl} />
              <DriveTile icon={<FileVideo2 size={18} />} label="素材" href={project.materialFolderUrl} />
              <DriveTile icon={<Send size={18} />} label="初稿" href={project.firstDraftFolderUrl} />
              <DriveTile icon={<RefreshCw size={18} />} label="修正版" href={project.revisionFolderUrl} />
              <DriveTile icon={<CheckCircle2 size={18} />} label="完成動画" href={project.finalFolderUrl} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drive同期結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["script", "material", "first_draft", "revision", "final"].map((type) => {
                const found = project.driveFiles.some((file) => file.detectedType === type);
                const labels: Record<string, string> = {
                  script: "台本",
                  material: "素材フォルダ",
                  first_draft: "初稿提出フォルダ",
                  revision: "修正版フォルダ",
                  final: "完成動画フォルダ"
                };
                return <SyncResult key={type} label={labels[type]} found={found} />;
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ステータス提案</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.statusSuggestions.filter((suggestion) => !suggestion.isResolved).length === 0 ? (
                <p className="rounded-md border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  未対応の提案はありません。
                </p>
              ) : (
                project.statusSuggestions
                  .filter((suggestion) => !suggestion.isResolved)
                  .map((suggestion) => (
                    <div key={suggestion.id} className="rounded-md border bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <StatusBadge status={suggestion.suggestedStatus} />
                        <Button size="sm" onClick={() => updateProjectStatus(project.id, suggestion.suggestedStatus)}>
                          変更する
                        </Button>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{suggestion.reason}</p>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>検出ファイル</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.driveFiles.length === 0 ? (
                <p className="rounded-md border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  Drive同期を実行するとファイルが表示されます。
                </p>
              ) : (
                project.driveFiles.map((file) => (
                  <a
                    key={file.id}
                    href={file.webViewLink}
                    target="_blank"
                    className="grid gap-2 rounded-md border bg-white px-3 py-3 text-sm transition hover:border-primary hover:shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{file.detectedType}</span>
                  </a>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>履歴を追加</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3" onSubmit={submitHistory}>
                <div className="grid gap-3 sm:grid-cols-[.55fr_1fr]">
                  <Select value={historyType} onChange={(event) => setHistoryType(event.target.value as HistoryType)}>
                    {["初稿提出", "修正依頼", "再提出", "完成", "メモ", "Drive同期", "ステータス変更"].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                  <Input placeholder="関連ファイルURL" value={historyFileUrl} onChange={(event) => setHistoryFileUrl(event.target.value)} />
                </div>
                <Textarea placeholder="修正内容や報告内容" value={historyContent} onChange={(event) => setHistoryContent(event.target.value)} />
                <Button type="submit" className="justify-self-start">
                  履歴を追加
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>提出・修正履歴</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {visibleHistories.length} / {filteredHistories.length}件
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <HistoryFilterButton active={historyFilter === "work"} onClick={() => setHistoryFilter("work")}>
                  重要
                </HistoryFilterButton>
                <HistoryFilterButton active={historyFilter === "all"} onClick={() => setHistoryFilter("all")}>
                  すべて
                </HistoryFilterButton>
                {["初稿提出", "修正依頼", "再提出", "完成", "メモ", "Drive同期", "ステータス変更"].map((type) => (
                  <HistoryFilterButton
                    key={type}
                    active={historyFilter === type}
                    onClick={() => setHistoryFilter(type as HistoryType)}
                  >
                    {type}
                  </HistoryFilterButton>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {visibleHistories.length === 0 ? (
                <p className="rounded-md border border-dashed bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  表示する履歴はありません。
                </p>
              ) : (
                visibleHistories.map((history, index) => (
                  <div key={history.id} className="relative grid gap-3 border-l-2 border-slate-200 pb-5 pl-5 last:pb-0">
                    <span className="absolute -left-[7px] top-0 size-3 rounded-full border-2 border-white bg-primary" />
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">{formatDateTime(history.createdAt)}</p>
                        <p className="mt-1 text-sm font-medium">
                          {history.createdBy.name}: {history.type}
                        </p>
                      </div>
                      {!showAllHistories && index === 0 ? (
                        <span className="rounded-full bg-accent px-2 py-1 text-xs text-accent-foreground">最新</span>
                      ) : null}
                    </div>
                    {history.content ? <p className="text-sm leading-6 text-muted-foreground">{history.content}</p> : null}
                    {history.fileUrl ? (
                      <Link className="inline-flex text-sm font-medium text-primary hover:underline" href={history.fileUrl} target="_blank">
                        ファイルを開く
                      </Link>
                    ) : null}
                  </div>
                ))
              )}
              {filteredHistories.length > 3 ? (
                <div className="pt-4">
                  <Button variant="outline" size="sm" onClick={() => setShowAllHistories((value) => !value)}>
                    {showAllHistories ? "最新3件に戻す" : `残り${hiddenHistoryCount}件を表示`}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function HistoryFilterButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active ? "border-primary bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border bg-white px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function DriveTile({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  const content = (
    <>
      <span className="grid size-9 place-items-center rounded-md bg-muted text-muted-foreground">{icon}</span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{href ? "リンクあり" : "未検出"}</span>
      </span>
      {href ? <ExternalLink className="ml-auto text-muted-foreground" size={15} /> : null}
    </>
  );

  return href ? (
    <Link
      href={href}
      target="_blank"
      className="flex items-center gap-3 rounded-md border bg-white px-3 py-3 transition hover:border-primary hover:shadow-sm"
    >
      {content}
    </Link>
  ) : (
    <div className="flex items-center gap-3 rounded-md border border-dashed bg-muted/40 px-3 py-3 opacity-75">{content}</div>
  );
}

function SyncResult({ label, found }: { label: string; found: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm">
      <span>{label}</span>
      <span className={found ? "font-medium text-emerald-700" : "text-muted-foreground"}>{found ? "検出済み" : "未検出"}</span>
    </div>
  );
}
