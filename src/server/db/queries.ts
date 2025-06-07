import "server-only";

import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";
import {
  DB_FileType,
  DB_FolderType,
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export const QUERIES = {
  getFolders: function (folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.parent, folderId))
      .orderBy(foldersSchema.id);
  },
  getFiles: function (folderId: number) {
    return db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.parent, folderId))
      .orderBy(filesSchema.id);
  },
  getAllParentsForFolder: async function (folderId: number) {
    const parents = [];
    let currentId: number | null = folderId;
    while (currentId !== null) {
      const folder = await db
        .selectDistinct()
        .from(foldersSchema)
        .where(eq(foldersSchema.id, currentId));

      if (!folder[0]) {
        throw new Error("Parent folder not found");
      }
      parents.unshift(folder[0]);
      currentId = folder[0]?.parent;
    }
    return parents;
  },
  getFolderById: async function (folderId: number) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, folderId));
    return folder[0];
  },

  getRootFolderForUser: async function (userId: string) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)),
      );
    return folder[0];
  },

  // getAllChildrenForFolder: async function (
  //   folderId: number,
  //   children: {
  //     files: DB_FileType[];
  //     folders: DB_FolderType[];
  //   } | null,
  // ) {
  //   // Fetch all files and folders that are children of the given folder

  //   if (!children) {
  //     children = {
  //       files: [],
  //       folders: [],
  //     };
  //   }
  //   const [files, folders] = await Promise.all([
  //     db.select().from(filesSchema).where(eq(filesSchema.parent, folderId)),
  //     db.select().from(foldersSchema).where(eq(foldersSchema.parent, folderId)),
  //   ]);

  //   children.files.push(...files);
  //   children.folders.push(...folders);

  //   for (const folder of folders) {
  //     await QUERIES.getAllChildrenForFolder(folder.id, children);
  //   }

  //   return children;
  // },
};

export const MUTATIONS = {
  createFile: async function (input: {
    file: {
      name: string;
      size: number;
      url: string;
      UTkey: string;
      parent: number;
    };
    userId: string;
  }) {
    return await db.insert(filesSchema).values({
      ...input.file,
      ownerId: input.userId,
    });
  },
  onboardUser: async function (userId: string) {
    const rootFolder = await db
      .insert(foldersSchema)
      .values({
        name: "Root",
        parent: null,
        ownerId: userId,
      })
      .$returningId();
    const rootFolderId = rootFolder[0]!.id;
    await db.insert(foldersSchema).values([
      {
        name: "Trash",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Shared",
        parent: rootFolderId,
        ownerId: userId,
      },
      {
        name: "Documents",
        parent: rootFolderId,
        ownerId: userId,
      },
    ]);
    return rootFolderId;
  },
  createFolder: async function (folder: { name: string; parent: number }) {
    const owner = await auth();
    if (!owner.userId) {
      throw new Error("Unauthorized");
    }
    return await db
      .insert(foldersSchema)
      .values({ ...folder, ownerId: owner.userId });
  },
};
