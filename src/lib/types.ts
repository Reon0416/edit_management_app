export type Role = "manager" | "editor" | "both";

export type ProjectStatus =
  | "未着手"
  | "素材確認中"
  | "編集中"
  | "初稿提出済み"
  | "修正依頼あり"
  | "修正対応中"
  | "再提出済み"
  | "完成";

export type HistoryType =
  | "初稿提出"
  | "修正依頼"
  | "再提出"
  | "完成"
  | "メモ"
  | "Drive同期"
  | "ステータス変更";

export type DetectedType = "script" | "material" | "first_draft" | "revision" | "final" | "other";

export interface Member {
  id: string;
  name: string;
  email?: string;
  role: Role;
  createdAt: string;
}

export interface DriveFile {
  id: string;
  projectId: string;
  driveFileId: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  parentFolderId?: string;
  detectedType: DetectedType;
  size?: number;
  createdTime?: string;
  modifiedTime?: string;
  isTrashed?: boolean;
}

export interface ProjectHistory {
  id: string;
  projectId: string;
  type: HistoryType;
  content?: string;
  fileUrl?: string;
  fileId?: string;
  createdBy: Member;
  createdAt: string;
}

export interface StatusSuggestion {
  id: string;
  projectId: string;
  suggestedStatus: ProjectStatus;
  reason: string;
  relatedFileId?: string;
  isResolved: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  clientName?: string;
  manager: Member;
  editor: Member;
  status: ProjectStatus;
  dueDate?: string;
  memo?: string;
  driveFolderUrl: string;
  driveFolderId?: string;
  scriptUrl?: string;
  scriptFileId?: string;
  materialFolderUrl?: string;
  materialFolderId?: string;
  firstDraftFolderUrl?: string;
  firstDraftFolderId?: string;
  revisionFolderUrl?: string;
  revisionFolderId?: string;
  finalFolderUrl?: string;
  finalFolderId?: string;
  lastDriveSyncAt?: string;
  latestFileName?: string;
  latestFileUrl?: string;
  createdAt: string;
  updatedAt: string;
  driveFiles: DriveFile[];
  histories: ProjectHistory[];
  statusSuggestions: StatusSuggestion[];
}

export interface DriveScanItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  parents?: string[];
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  trashed?: boolean;
}
