"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/lib/project-store";
import { isManagerReviewStatus } from "@/lib/status";

export default function PeoplePage() {
  const { projects, members } = useProjects();

  return (
    <>
      <PageHeader title="担当者別" description="管理者・編集者ごとの担当案件数、確認待ち、修正対応中を確認します。" />
      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>編集者別</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {members
              .filter((member) => member.role !== "manager")
              .map((member) => {
                const assigned = projects.filter((project) => project.editor.id === member.id);
                return <PersonBlock key={member.id} name={member.name} projects={assigned} mode="editor" />;
              })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>管理者別</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {members
              .filter((member) => member.role !== "editor")
              .map((member) => {
                const assigned = projects.filter((project) => project.manager.id === member.id);
                return <PersonBlock key={member.id} name={member.name} projects={assigned} mode="manager" />;
              })}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function PersonBlock({
  name,
  projects,
  mode
}: {
  name: string;
  projects: ReturnType<typeof useProjects>["projects"];
  mode: "manager" | "editor";
}) {
  const reviewCount = projects.filter((project) => isManagerReviewStatus(project.status)).length;
  const revisionCount = projects.filter((project) => project.status === "修正対応中").length;

  return (
    <div className="rounded-md border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            担当中 {projects.length}件 / 確認待ち {reviewCount}件 / 修正対応中 {revisionCount}件
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">担当案件はありません。</p>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center justify-between gap-3 rounded-md bg-muted/60 px-3 py-2 hover:bg-muted"
            >
              <span className="text-sm">{project.name}</span>
              <StatusBadge status={project.status} />
            </Link>
          ))
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{mode === "manager" ? "確認待ちの偏り確認に使います。" : "編集作業の偏り確認に使います。"}</p>
    </div>
  );
}
