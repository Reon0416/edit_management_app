import type { AppUser, Member, Project } from "@/lib/types";

export const seedMembers: Member[] = [
  {
    id: "member-tanaka",
    name: "田中",
    email: "tanaka@example.com",
    role: "manager",
    createdAt: "2026-05-01T09:00:00+09:00"
  },
  {
    id: "member-yamada",
    name: "山田",
    email: "yamada@example.com",
    role: "manager",
    createdAt: "2026-05-01T09:00:00+09:00"
  },
  {
    id: "member-sato",
    name: "佐藤",
    email: "sato@example.com",
    role: "editor",
    createdAt: "2026-05-01T09:00:00+09:00"
  },
  {
    id: "member-suzuki",
    name: "鈴木",
    email: "suzuki@example.com",
    role: "editor",
    createdAt: "2026-05-01T09:00:00+09:00"
  },
  {
    id: "member-kobayashi",
    name: "小林",
    email: "kobayashi@example.com",
    role: "manager",
    createdAt: "2026-05-01T09:00:00+09:00"
  },
  {
    id: "member-ito",
    name: "伊藤",
    email: "ito@example.com",
    role: "manager",
    createdAt: "2026-05-01T09:00:00+09:00"
  },
  {
    id: "member-nakamura",
    name: "中村",
    email: "nakamura@example.com",
    role: "manager",
    createdAt: "2026-05-01T09:00:00+09:00"
  },
  {
    id: "member-kato",
    name: "加藤",
    email: "kato@example.com",
    role: "editor",
    createdAt: "2026-05-01T09:00:00+09:00"
  },
  {
    id: "member-watanabe",
    name: "渡辺",
    email: "watanabe@example.com",
    role: "editor",
    createdAt: "2026-05-01T09:00:00+09:00"
  },
  {
    id: "member-yoshida",
    name: "吉田",
    email: "yoshida@example.com",
    role: "editor",
    createdAt: "2026-05-01T09:00:00+09:00"
  }
];

export const seedAppUsers: AppUser[] = [
  {
    id: "app-operator-tanaka",
    name: "田中",
    email: "tanaka@example.com",
    role: "operator",
    linkedMemberId: "member-tanaka"
  },
  {
    id: "app-operator-yamada",
    name: "山田",
    email: "yamada@example.com",
    role: "operator",
    linkedMemberId: "member-yamada"
  },
  {
    id: "app-operator-kobayashi",
    name: "小林",
    email: "kobayashi@example.com",
    role: "operator",
    linkedMemberId: "member-kobayashi"
  },
  {
    id: "app-operator-ito",
    name: "伊藤",
    email: "ito@example.com",
    role: "operator",
    linkedMemberId: "member-ito"
  },
  {
    id: "app-operator-nakamura",
    name: "中村",
    email: "nakamura@example.com",
    role: "operator",
    linkedMemberId: "member-nakamura"
  },
  {
    id: "app-editor-sato",
    name: "佐藤",
    email: "sato@example.com",
    role: "editor",
    linkedMemberId: "member-sato"
  },
  {
    id: "app-editor-suzuki",
    name: "鈴木",
    email: "suzuki@example.com",
    role: "editor",
    linkedMemberId: "member-suzuki"
  },
  {
    id: "app-editor-kato",
    name: "加藤",
    email: "kato@example.com",
    role: "editor",
    linkedMemberId: "member-kato"
  },
  {
    id: "app-editor-watanabe",
    name: "渡辺",
    email: "watanabe@example.com",
    role: "editor",
    linkedMemberId: "member-watanabe"
  },
  {
    id: "app-editor-yoshida",
    name: "吉田",
    email: "yoshida@example.com",
    role: "editor",
    linkedMemberId: "member-yoshida"
  }
];

export const seedProjects: Project[] = [
  {
    id: "project-toshin-may",
    name: "東進5月動画",
    clientName: "東進",
    manager: seedMembers[0],
    editor: seedMembers[2],
    status: "修正対応中",
    dueDate: "2026-05-20",
    memo: "冒頭テンポとテロップ修正を優先。",
    driveFolderUrl: "https://drive.google.com/drive/folders/sample-toshin",
    driveFolderId: "sample-toshin",
    scriptUrl: "https://drive.google.com/file/d/sample-script/view",
    materialFolderUrl: "https://drive.google.com/drive/folders/sample-material",
    firstDraftFolderUrl: "https://drive.google.com/drive/folders/sample-first",
    revisionFolderUrl: "https://drive.google.com/drive/folders/sample-revision",
    finalFolderUrl: "https://drive.google.com/drive/folders/sample-final",
    lastDriveSyncAt: "2026-05-15T14:30:00+09:00",
    latestFileName: "東進_初稿_v1.mp4",
    latestFileUrl: "https://drive.google.com/file/d/sample-video/view",
    createdAt: "2026-05-10T10:00:00+09:00",
    updatedAt: "2026-05-15T16:30:00+09:00",
    driveFiles: [
      {
        id: "drive-1",
        projectId: "project-toshin-may",
        driveFileId: "sample-script",
        name: "台本スプレッドシート",
        mimeType: "application/vnd.google-apps.spreadsheet",
        webViewLink: "https://drive.google.com/file/d/sample-script/view",
        detectedType: "script",
        modifiedTime: "2026-05-15T13:00:00+09:00"
      },
      {
        id: "drive-2",
        projectId: "project-toshin-may",
        driveFileId: "sample-video",
        name: "東進_初稿_v1.mp4",
        mimeType: "video/mp4",
        webViewLink: "https://drive.google.com/file/d/sample-video/view",
        parentFolderId: "sample-first",
        detectedType: "first_draft",
        size: 284000000,
        modifiedTime: "2026-05-15T14:30:00+09:00"
      }
    ],
    histories: [
      {
        id: "history-1",
        projectId: "project-toshin-may",
        type: "初稿提出",
        content: "初稿を提出しました。",
        fileUrl: "https://drive.google.com/file/d/sample-video/view",
        createdBy: seedMembers[2],
        createdAt: "2026-05-15T14:30:00+09:00"
      },
      {
        id: "history-2",
        projectId: "project-toshin-may",
        type: "修正依頼",
        content: "冒頭のテンポを上げて、テロップ誤字を修正してください。",
        createdBy: seedMembers[0],
        createdAt: "2026-05-15T16:00:00+09:00"
      }
    ],
    statusSuggestions: [
      {
        id: "suggestion-1",
        projectId: "project-toshin-may",
        suggestedStatus: "再提出済み",
        reason: "修正版フォルダに新しい動画が追加されたら提案されます。",
        isResolved: false,
        createdAt: "2026-05-15T16:05:00+09:00"
      }
    ]
  },
  {
    id: "project-salon-tiktok",
    name: "美容サロンTikTok",
    clientName: "美容サロン",
    manager: seedMembers[1],
    editor: seedMembers[3],
    status: "初稿提出済み",
    dueDate: "2026-05-18",
    driveFolderUrl: "https://drive.google.com/drive/folders/sample-salon",
    driveFolderId: "sample-salon",
    firstDraftFolderUrl: "https://drive.google.com/drive/folders/sample-salon-first",
    lastDriveSyncAt: "2026-05-14T18:10:00+09:00",
    latestFileName: "salon_tiktok_v1.mov",
    latestFileUrl: "https://drive.google.com/file/d/sample-salon-video/view",
    createdAt: "2026-05-11T10:00:00+09:00",
    updatedAt: "2026-05-14T18:10:00+09:00",
    driveFiles: [],
    histories: [],
    statusSuggestions: []
  },
  {
    id: "project-restaurant-short",
    name: "飲食店ショート動画",
    clientName: "飲食店",
    manager: seedMembers[0],
    editor: seedMembers[2],
    status: "編集中",
    dueDate: "2026-05-22",
    driveFolderUrl: "https://drive.google.com/drive/folders/sample-restaurant",
    driveFolderId: "sample-restaurant",
    createdAt: "2026-05-12T10:00:00+09:00",
    updatedAt: "2026-05-14T11:00:00+09:00",
    driveFiles: [],
    histories: [],
    statusSuggestions: []
  }
];
