"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { extractDriveFolderId } from "@/lib/drive";
import { useProjects } from "@/lib/project-store";
import { PROJECT_STATUSES } from "@/lib/status";
import type { ProjectStatus } from "@/lib/types";

export default function NewProjectPage() {
  const router = useRouter();
  const { members, addProject, syncProjectWithMockDrive } = useProjects();
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    managerId: members.find((member) => member.role !== "editor")?.id ?? "",
    editorId: members.find((member) => member.role !== "manager")?.id ?? "",
    status: "未着手" as ProjectStatus,
    dueDate: "",
    memo: "",
    driveFolderUrl: ""
  });

  const folderId = extractDriveFolderId(form.driveFolderUrl);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const project = addProject(form);
    syncProjectWithMockDrive(project.id);
    router.push(`/projects/${project.id}`);
  }

  return (
    <>
      <PageHeader title="案件作成" description="案件名、Driveフォルダ、担当者、納期を登録し、Drive同期結果を確認します。" />
      <form className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="案件名">
              <Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </Field>
            <Field label="クライアント名">
              <Input value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} />
            </Field>
            <Field label="管理者">
              <Select required value={form.managerId} onChange={(event) => setForm({ ...form, managerId: event.target.value })}>
                {members
                  .filter((member) => member.role !== "editor")
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="編集者">
              <Select required value={form.editorId} onChange={(event) => setForm({ ...form, editorId: event.target.value })}>
                {members
                  .filter((member) => member.role !== "manager")
                  .map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="ステータス">
              <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectStatus })}>
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="納期">
              <Input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
            </Field>
            <Field label="案件Google DriveフォルダURL" className="md:col-span-2">
              <Input
                required
                placeholder="https://drive.google.com/drive/folders/..."
                value={form.driveFolderUrl}
                onChange={(event) => setForm({ ...form, driveFolderUrl: event.target.value })}
              />
            </Field>
            <Field label="メモ" className="md:col-span-2">
              <Textarea value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} />
            </Field>
            <div className="md:col-span-2">
              <Button type="submit">Driveを読み取って案件作成</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drive同期プレビュー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SyncRow label="フォルダID" value={folderId || "未検出"} detected={Boolean(folderId)} />
            <SyncRow label="台本" value="作成後に自動分類" detected={Boolean(folderId)} />
            <SyncRow label="素材フォルダ" value="作成後に自動分類" detected={Boolean(folderId)} />
            <SyncRow label="初稿フォルダ" value="作成後に自動分類" detected={Boolean(folderId)} />
            <SyncRow label="修正版フォルダ" value="未検出時は手動指定" detected={false} />
            <SyncRow label="完成動画フォルダ" value="未検出時は手動指定" detected={false} />
          </CardContent>
        </Card>
      </form>
    </>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function SyncRow({ label, value, detected }: { label: string; value: string; detected: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-white px-3 py-2">
      <span className="text-sm font-medium">{label}</span>
      <span className={detected ? "text-sm text-emerald-700" : "text-sm text-muted-foreground"}>{value}</span>
    </div>
  );
}
