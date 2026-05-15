import { google } from "googleapis";
import { NextResponse } from "next/server";
import { classifyDriveItem, extractDriveFolderId, getLatestDriveItem, suggestStatusFromDrive } from "@/lib/drive";
import type { DriveScanItem } from "@/lib/types";

const FIELDS = "files(id,name,mimeType,webViewLink,parents,size,createdTime,modifiedTime,trashed)";

export async function POST(request: Request) {
  const body = (await request.json()) as { folderUrl?: string; folderId?: string; accessToken?: string };
  const folderId = body.folderId ?? (body.folderUrl ? extractDriveFolderId(body.folderUrl) : "");
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const accessToken = body.accessToken ?? bearer ?? process.env.GOOGLE_ACCESS_TOKEN;

  if (!folderId) {
    return NextResponse.json({ error: "Drive folder ID could not be resolved." }, { status: 400 });
  }
  if (!accessToken) {
    return NextResponse.json({ error: "Google access token is required." }, { status: 401 });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const drive = google.drive({ version: "v3", auth });

  const rootItems = await listChildren(drive, folderId);
  const classifiedRoot = rootItems.map((item) => ({ ...item, detectedType: classifyDriveItem(item) }));
  const importantFolders = classifiedRoot.filter(
    (item) => item.mimeType === "application/vnd.google-apps.folder" && item.detectedType !== "other"
  );
  const folderTypeById = new Map(importantFolders.map((folder) => [folder.id, folder.detectedType]));

  const nestedResults = await Promise.all(importantFolders.map((folder) => listChildren(drive, folder.id)));
  const nestedItems = nestedResults.flat();
  const classifiedNested = nestedItems.map((item) => {
    const inheritedType = item.parents?.map((parent) => folderTypeById.get(parent)).find(Boolean);
    return { ...item, detectedType: inheritedType ?? classifyDriveItem(item) };
  });
  const allItems = [...rootItems, ...nestedItems];
  const classified = [...classifiedRoot, ...classifiedNested];
  const latest = getLatestDriveItem(allItems);
  const suggestions = suggestStatusFromDrive(classified);

  return NextResponse.json({
    folderId,
    latestFile: latest,
    files: classified,
    suggestions
  });
}

async function listChildren(drive: ReturnType<typeof google.drive>, folderId: string): Promise<DriveScanItem[]> {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: FIELDS,
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  return (response.data.files ?? []).map((file) => ({
    id: file.id ?? "",
    name: file.name ?? "",
    mimeType: file.mimeType ?? "application/octet-stream",
    webViewLink: file.webViewLink ?? "",
    parents: file.parents ?? undefined,
    size: file.size ?? undefined,
    createdTime: file.createdTime ?? undefined,
    modifiedTime: file.modifiedTime ?? undefined,
    trashed: file.trashed ?? false
  }));
}
