import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Programmatically zips the contents of a directory using native Windows system commands.
 * Highly robust and lightweight with zero npm external package requirements.
 */
export async function zipFolder(sourceDir: string, destZipPath: string): Promise<void> {
  const absSource = path.resolve(sourceDir);
  const absDest = path.resolve(destZipPath);

  // Ensure destination directory exists
  const destDir = path.dirname(absDest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Remove existing destination zip if any
  if (fs.existsSync(absDest)) {
    fs.unlinkSync(absDest);
  }

  try {
    // Compress-Archive -Path 'source\*' compresses all contents inside the folder
    const cmd = `powershell.exe -NoProfile -Command "Compress-Archive -Path '${absSource}\\*' -DestinationPath '${absDest}' -Force"`;
    await execAsync(cmd);
  } catch (error: unknown) {
    // Fallback to native tar command (available in Windows 10 build 17063 and later)
    try {
      const tarCmd = `tar -a -c -f "${absDest}" -C "${absSource}" .`;
      await execAsync(tarCmd);
    } catch (tarError: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const tarMsg = tarError instanceof Error ? tarError.message : String(tarError);
      throw new Error(`Failed to zip folder using Powershell and Tar. Powershell error: ${msg}. Tar error: ${tarMsg}`);
    }
  }
}

/**
 * Zips a folder including the folder itself as a single main parent directory in the archive.
 */
export async function zipFolderWithParent(parentDir: string, folderName: string, destZipPath: string): Promise<void> {
  const absParent = path.resolve(parentDir);
  const absDest = path.resolve(destZipPath);

  // Ensure destination directory exists
  const destDir = path.dirname(absDest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Remove existing destination zip if any
  if (fs.existsSync(absDest)) {
    fs.unlinkSync(absDest);
  }

  try {
    const cmd = `powershell.exe -NoProfile -Command "Compress-Archive -Path '${absParent}\\${folderName}' -DestinationPath '${absDest}' -Force"`;
    await execAsync(cmd);
  } catch (error: unknown) {
    try {
      const tarCmd = `tar -a -c -f "${absDest}" -C "${absParent}" "${folderName}"`;
      await execAsync(tarCmd);
    } catch (tarError: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const tarMsg = tarError instanceof Error ? tarError.message : String(tarError);
      throw new Error(`Failed to zip folder with parent using Powershell and Tar. Powershell error: ${msg}. Tar error: ${tarMsg}`);
    }
  }
}
