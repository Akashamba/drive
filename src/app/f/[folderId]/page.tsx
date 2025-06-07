import { Button } from "~/components/ui/button";
import DriveContents from "../../drive-contents";
import { MUTATIONS, QUERIES } from "~/server/db/queries";
import { FolderPlus } from "lucide-react";

export default async function GoogleDriveClone(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;
  const parsedFolderId = parseInt(params.folderId);

  if (isNaN(parsedFolderId)) {
    return <div>Invalid folder ID</div>;
  }

  const [folders, files, parents] = await Promise.all([
    QUERIES.getFolders(parsedFolderId),
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getAllParentsForFolder(parsedFolderId),
  ]);

  return (
    <>
      <Button variant="ghost" className="mr-5" aria-label="New Folder">
        <FolderPlus
          size={16}
          onClick={() =>
            MUTATIONS.createFolder({
              name: "New Folder",
              parent: parsedFolderId,
            })
          }
        />
        New Folder
      </Button>
      <DriveContents
        files={files}
        folders={folders}
        parents={parents}
        currentFolderId={parsedFolderId}
      />
    </>
  );
}
