"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { useProjects } from "@/lib/project-store";
import type { Role } from "@/lib/types";

export default function SettingsPage() {
  const { members, currentAppUser, addMember } = useProjects();
  const [form, setForm] = useState({ name: "", email: "", role: "editor" as Role });
  const supabaseConfigured =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    addMember(form);
    setForm({ name: "", email: "", role: "editor" });
  }

  if (currentAppUser.role === "editor") {
    return (
      <>
        <PageHeader title="設定" description="設定は運営者専用です。" />
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">編集者は担当案件の確認と作業更新に集中する画面だけを使用します。</p>
            <Button asChild className="mt-4" href="/projects">
              担当案件へ
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="設定" description="Google Drive連携状態、分類ルール、担当者を管理します。" />
      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Drive連携</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border bg-white px-3 py-2 text-sm">
                Supabase Auth: {supabaseConfigured ? "環境変数設定済み" : "未設定"}
              </div>
              <Button disabled={!supabaseConfigured}>Googleでログイン</Button>
              <p className="text-sm text-muted-foreground">
                SupabaseのGoogle OAuthを有効化し、Drive APIスコープを付与すると実認証に接続できます。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>自動分類ルール</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Rule condition="名前に「台本」またはGoogleスプレッドシート" result="script" />
              <Rule condition="名前に「素材」または「撮影素材」" result="material" />
              <Rule condition="名前に「初稿」" result="first_draft" />
              <Rule condition="名前に「修正」または「修正版」" result="revision" />
              <Rule condition="名前に「完成」または「納品」" result="final" />
              <Rule condition="上記以外" result="other" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>担当者を追加</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 md:grid-cols-[1fr_1fr_.7fr_auto]" onSubmit={submit}>
                <Input required placeholder="名前" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                <Input placeholder="メール" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}>
                  <option value="manager">manager</option>
                  <option value="editor">editor</option>
                  <option value="both">both</option>
                </Select>
                <Button type="submit">追加</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ユーザー一覧</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="grid gap-2 rounded-md border bg-white px-3 py-2 text-sm sm:grid-cols-[1fr_1fr_.5fr]">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-muted-foreground">{member.email ?? "-"}</span>
                  <span>{member.role}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function Rule({ condition, result }: { condition: string; result: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-white px-3 py-2">
      <span>{condition}</span>
      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{result}</span>
    </div>
  );
}
