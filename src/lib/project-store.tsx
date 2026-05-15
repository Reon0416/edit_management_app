"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { classifyDriveItem, extractDriveFolderId, getLatestDriveItem, suggestStatusFromDrive } from "@/lib/drive";
import { seedAppUsers, seedMembers, seedProjects } from "@/lib/seed";
import type { AppUser, DriveScanItem, HistoryType, Member, Project, ProjectStatus } from "@/lib/types";

interface ProjectCreateInput {
  name: string;
  clientName?: string;
  managerId: string;
  editorId: string;
  status: ProjectStatus;
  dueDate?: string;
  memo?: string;
  driveFolderUrl: string;
}

interface ProjectStoreValue {
  projects: Project[];
  visibleProjects: Project[];
  members: Member[];
  appUsers: AppUser[];
  currentAppUser: AppUser;
  setCurrentAppUserId: (userId: string) => void;
  addProject: (input: ProjectCreateInput) => Project;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  addHistory: (projectId: string, type: HistoryType, content: string, fileUrl?: string) => void;
  syncProjectWithMockDrive: (projectId: string) => void;
  addMember: (member: Pick<Member, "name" | "email" | "role">) => void;
}

const ProjectStoreContext = createContext<ProjectStoreValue | null>(null);
const STORAGE_KEY = "editflow-manager-store";

export function ProjectStoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [appUsers, setAppUsers] = useState<AppUser[]>(seedAppUsers);
  const [currentAppUserId, setCurrentAppUserId] = useState(seedAppUsers[0].id);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        projects: Project[];
        members: Member[];
        appUsers?: AppUser[];
        currentAppUserId?: string;
      };
      setProjects(parsed.projects);
      setMembers(mergeById(parsed.members, seedMembers));
      setAppUsers(mergeById(parsed.appUsers ?? [], seedAppUsers));
      setCurrentAppUserId(parsed.currentAppUserId ?? seedAppUsers[0].id);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, members, appUsers, currentAppUserId }));
  }, [appUsers, currentAppUserId, members, projects]);

  const value = useMemo<ProjectStoreValue>(
    () => {
      const currentAppUser = appUsers.find((user) => user.id === currentAppUserId) ?? appUsers[0] ?? seedAppUsers[0];
      const visibleProjects =
        currentAppUser.role === "operator"
          ? projects.filter(
              (project) =>
                project.editor.id === currentAppUser.linkedMemberId || project.manager.id === currentAppUser.linkedMemberId
            )
          : projects.filter((project) => project.editor.id === currentAppUser.linkedMemberId);
      const currentMember =
        members.find((member) => member.id === currentAppUser.linkedMemberId) ??
        members.find((member) => member.role === (currentAppUser.role === "operator" ? "manager" : "editor")) ??
        members[0];

      return {
        projects,
        visibleProjects,
        members,
        appUsers,
        currentAppUser,
        setCurrentAppUserId,
      addProject(input) {
        const manager = members.find((member) => member.id === input.managerId) ?? members[0];
        const editor = members.find((member) => member.id === input.editorId) ?? members[0];
        const now = new Date().toISOString();
        const project: Project = {
          id: `project-${crypto.randomUUID()}`,
          name: input.name,
          clientName: input.clientName,
          manager,
          editor,
          status: input.status,
          dueDate: input.dueDate,
          memo: input.memo,
          driveFolderUrl: input.driveFolderUrl,
          driveFolderId: extractDriveFolderId(input.driveFolderUrl),
          createdAt: now,
          updatedAt: now,
          driveFiles: [],
          histories: [
            {
              id: `history-${crypto.randomUUID()}`,
              projectId: "",
              type: "メモ",
              content: "案件を作成しました。",
              createdBy: manager,
              createdAt: now
            }
          ],
          statusSuggestions: []
        };
        project.histories = project.histories.map((history) => ({ ...history, projectId: project.id }));
        setProjects((current) => [project, ...current]);
        return project;
      },
      updateProjectStatus(projectId, status) {
        setProjects((current) =>
          current.map((project) => {
            if (project.id !== projectId) return project;
            const now = new Date().toISOString();
            return {
              ...project,
              status,
              updatedAt: now,
              statusSuggestions: project.statusSuggestions.map((suggestion) =>
                suggestion.suggestedStatus === status ? { ...suggestion, isResolved: true } : suggestion
              ),
              histories: [
                {
                  id: `history-${crypto.randomUUID()}`,
                  projectId,
                  type: "ステータス変更",
                  content: `ステータスを「${status}」に変更しました。`,
                  createdBy: currentMember,
                  createdAt: now
                },
                ...project.histories
              ]
            };
          })
        );
      },
      addHistory(projectId, type, content, fileUrl) {
        setProjects((current) =>
          current.map((project) => {
            if (project.id !== projectId) return project;
            return {
              ...project,
              updatedAt: new Date().toISOString(),
              histories: [
                {
                  id: `history-${crypto.randomUUID()}`,
                  projectId,
                  type,
                  content,
                  fileUrl,
                  createdBy: currentMember,
                  createdAt: new Date().toISOString()
                },
                ...project.histories
              ]
            };
          })
        );
      },
      syncProjectWithMockDrive(projectId) {
        setProjects((current) =>
          current.map((project) => {
            if (project.id !== projectId) return project;
            const now = new Date().toISOString();
            const mockItems: DriveScanItem[] = [
              {
                id: `drive-script-${project.id}`,
                name: `${project.name}_台本`,
                mimeType: "application/vnd.google-apps.spreadsheet",
                webViewLink: project.driveFolderUrl,
                modifiedTime: now
              },
              {
                id: `drive-material-${project.id}`,
                name: `${project.name}_撮影素材.mp4`,
                mimeType: "video/mp4",
                webViewLink: project.driveFolderUrl,
                modifiedTime: now
              },
              {
                id: `drive-first-${project.id}`,
                name: `${project.name}_初稿_v1.mp4`,
                mimeType: "video/mp4",
                webViewLink: project.driveFolderUrl,
                modifiedTime: now
              }
            ];
            const classified = mockItems.map((item) => ({ ...item, detectedType: classifyDriveItem(item) }));
            const latest = getLatestDriveItem(mockItems);
            const suggestions = suggestStatusFromDrive(classified);
            return {
              ...project,
              scriptUrl: project.scriptUrl ?? project.driveFolderUrl,
              materialFolderUrl: project.materialFolderUrl ?? project.driveFolderUrl,
              firstDraftFolderUrl: project.firstDraftFolderUrl ?? project.driveFolderUrl,
              lastDriveSyncAt: now,
              latestFileName: latest?.name,
              latestFileUrl: latest?.webViewLink,
              updatedAt: now,
              driveFiles: classified.map((item) => ({
                id: `record-${item.id}`,
                projectId,
                driveFileId: item.id,
                name: item.name,
                mimeType: item.mimeType,
                webViewLink: item.webViewLink,
                detectedType: item.detectedType,
                modifiedTime: item.modifiedTime
              })),
              statusSuggestions: suggestions.map((suggestion) => ({
                id: `suggestion-${crypto.randomUUID()}`,
                projectId,
                suggestedStatus: suggestion.status,
                reason: suggestion.reason,
                relatedFileId: suggestion.relatedFileId,
                isResolved: false,
                createdAt: now
              })),
              histories: [
                {
                  id: `history-${crypto.randomUUID()}`,
                  projectId,
                  type: "Drive同期",
                  content: "Driveフォルダを同期し、分類結果とステータス候補を更新しました。",
                  createdBy: currentMember,
                  createdAt: now
                },
                ...project.histories
              ]
            };
          })
        );
      },
      addMember(member) {
        const now = new Date().toISOString();
        setMembers((current) => [
          ...current,
          {
            id: `member-${crypto.randomUUID()}`,
            name: member.name,
            email: member.email,
            role: member.role,
            createdAt: now
          }
        ]);
      }
    };
    },
    [appUsers, currentAppUserId, members, projects]
  );

  return <ProjectStoreContext.Provider value={value}>{children}</ProjectStoreContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectStoreContext);
  if (!context) throw new Error("useProjects must be used inside ProjectStoreProvider");
  return context;
}

function mergeById<T extends { id: string }>(stored: T[], fallback: T[]) {
  const map = new Map<string, T>();
  for (const item of fallback) map.set(item.id, item);
  for (const item of stored) map.set(item.id, item);
  return Array.from(map.values());
}
