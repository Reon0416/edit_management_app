import type { ProjectStatus } from "@/lib/types";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "未着手",
  "素材確認中",
  "編集中",
  "初稿提出済み",
  "修正依頼あり",
  "修正対応中",
  "再提出済み",
  "完成"
];

export const statusStyles: Record<ProjectStatus, string> = {
  未着手: "bg-slate-100 text-slate-700 border-slate-200",
  素材確認中: "bg-sky-50 text-sky-700 border-sky-200",
  編集中: "bg-blue-50 text-blue-700 border-blue-200",
  初稿提出済み: "bg-amber-50 text-amber-700 border-amber-200",
  修正依頼あり: "bg-rose-50 text-rose-700 border-rose-200",
  修正対応中: "bg-orange-50 text-orange-700 border-orange-200",
  再提出済み: "bg-violet-50 text-violet-700 border-violet-200",
  完成: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

export function getNextActor(status: ProjectStatus) {
  if (status === "初稿提出済み" || status === "再提出済み") return "管理者";
  if (status === "完成") return "なし";
  return "編集者";
}

export function getNextAction(status: ProjectStatus) {
  const actions: Record<ProjectStatus, string> = {
    未着手: "素材と台本を確認する",
    素材確認中: "編集作業を開始する",
    編集中: "初稿を提出する",
    初稿提出済み: "初稿を確認する",
    修正依頼あり: "修正内容を確認する",
    修正対応中: "修正版を提出する",
    再提出済み: "修正版を確認する",
    完成: "対応完了"
  };
  return actions[status];
}

export function getNextStatusCandidates(status: ProjectStatus): ProjectStatus[] {
  const candidates: Record<ProjectStatus, ProjectStatus[]> = {
    未着手: ["素材確認中", "編集中"],
    素材確認中: ["編集中"],
    編集中: ["初稿提出済み", "修正対応中", "完成"],
    初稿提出済み: ["修正依頼あり", "完成"],
    修正依頼あり: ["修正対応中"],
    修正対応中: ["再提出済み"],
    再提出済み: ["修正依頼あり", "完成"],
    完成: []
  };
  return candidates[status];
}

export function isManagerReviewStatus(status: ProjectStatus) {
  return status === "初稿提出済み" || status === "再提出済み";
}
