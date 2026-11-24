import * as fs from "fs/promises"

import MinExportPlugin from "./main";
import { FileSystemAdapter, TFile } from "obsidian";
import path from "path";

// DANGER: Will be deleted on sync. Hardcoded for safety
const EXPORT = '/home/kieran/Documents/src/garden/content/'

export function getApplicableFiles(plugin: MinExportPlugin) {
  const { vault, metadataCache } = plugin.app
  const { settings } = plugin

  const files: TFile[] = []
  for (const file of vault.getMarkdownFiles()) {
    const meta = metadataCache.getCache(file.path)
    if (meta?.frontmatter == null) continue

    if (meta.frontmatter[settings.frontmatterKey] !== true) continue

    files.push(file)

    const refs = meta.embeds?.map(e => e.link) ?? []
    if (meta.frontmatterLinks) refs.push(...meta.frontmatterLinks.map(l => l.link))
    for (const link of refs) {
      const linkFile = metadataCache.getFirstLinkpathDest(link, file.path)
      if (!linkFile) continue

      if (linkFile?.parent && settings.allowedTranscludeFolders.includes(linkFile.parent.path)) {
        files.push(linkFile)
      }
    }
  }

  return files
}

export async function syncGarden(plugin: MinExportPlugin, files: TFile[]) {
  const { vault, metadataCache, fileManager } = plugin.app
  if (!(vault.adapter instanceof FileSystemAdapter)) return
  const root = vault.adapter.getBasePath()
  await fs.rm(EXPORT, { recursive: true })
  await fs.mkdir(EXPORT)


  await Promise.all(files.map(async file => {
    const out = path.join(EXPORT, file.path)
    await fs.mkdir(path.dirname(out), { recursive: true })
    await fs.copyFile(path.join(root, file.path), out)
  }))
}
