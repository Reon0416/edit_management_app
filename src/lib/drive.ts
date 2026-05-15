import type { DetectedType, DriveScanItem, ProjectStatus } from "@/lib/types";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const SHEET_MIME = "application/vnd.google-apps.spreadsheet";

export function extractDriveFolderId(url: string) {
  const trimmed = url.trim();
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch?.[1]) return folderMatch[1];
  const idParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParam?.[1]) return idParam[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;
  return "";
}

export function classifyDriveItem(item: Pick<DriveScanItem, "name" | "mimeType">): DetectedType {
  const name = item.name.toLowerCase();
  if (item.mimeType === SHEET_MIME || name.includes("台本")) return "script";
  if (name.includes("撮影素材") || name.includes("素材")) return "material";
  if (name.includes("初稿")) return "first_draft";
  if (name.includes("修正版") || name.includes("修正")) return "revision";
  if (name.includes("完成") || name.includes("納品")) return "final";
  return "other";
}

export function isFolder(item: Pick<DriveScanItem, "mimeType">) {
  return item.mimeType === FOLDER_MIME;
}

export function isVideoFile(item: Pick<DriveScanItem, "name" | "mimeType">) {
  const lowerName = item.name.toLowerCase();
  return (
    item.mimeType.startsWith("video/") ||
    [".mp4", ".mov", ".m4v", ".avi"].some((extension) => lowerName.endsWith(extension))
  );
}

export function suggestStatusFromDrive(files: Array<DriveScanItem & { detectedType: DetectedType }>) {
  const suggestions: Array<{ status: ProjectStatus; reason: string; relatedFileId?: string }> = [];
  const firstDraftVideo = files.find((file) => file.detectedType === "first_draft" && isVideoFile(file));
  const revisionVideo = files.find((file) => file.detectedType === "revision" && isVideoFile(file));
  const finalVideo = files.find((file) => file.detectedType === "final" && isVideoFile(file));
  const hasMaterialVideo = files.some((file) => file.detectedType === "material" && isVideoFile(file));
  const hasScript = files.some((file) => file.detectedType === "script");

  if (firstDraftVideo) {
    suggestions.push({
      status: "初稿提出済み",
      reason: `初稿フォルダに動画「${firstDraftVideo.name}」が見つかりました。`,
      relatedFileId: firstDraftVideo.id
    });
  }
  if (revisionVideo) {
    suggestions.push({
      status: "再提出済み",
      reason: `修正版フォルダに動画「${revisionVideo.name}」が見つかりました。`,
      relatedFileId: revisionVideo.id
    });
  }
  if (finalVideo) {
    suggestions.push({
      status: "完成",
      reason: `完成動画フォルダに動画「${finalVideo.name}」が見つかりました。`,
      relatedFileId: finalVideo.id
    });
  }
  if (hasMaterialVideo && hasScript) {
    suggestions.push({
      status: "素材確認中",
      reason: "素材フォルダに動画があり、台本も検出されています。"
    });
  }

  return suggestions;
}

export function getLatestDriveItem(files: DriveScanItem[]) {
  return [...files]
    .filter((file) => !file.trashed)
    .sort((a, b) => {
      const left = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
      const right = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
      return right - left;
    })[0];
}
