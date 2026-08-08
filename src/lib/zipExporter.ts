import JSZip from 'jszip';
import { MASTER_REPO_FILES } from '../data/masterRepoData';

export async function exportMasterRepoZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder("romeo-hydra-master");

  if (!rootFolder) return;

  for (const file of MASTER_REPO_FILES) {
    if (file.type === 'image') {
      // Add a placeholder file for image asset
      rootFolder.file(file.path, "# ROMEO-HYDRA Logic Card Physical Render Asset\n# Binary SVG / JPG Reference Asset\n");
    } else {
      rootFolder.file(file.path, file.content);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = "romeo-hydra-master.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
