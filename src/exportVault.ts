import * as fs from "fs/promises"

import MinExportPlugin from "./main";
import { FileSystemAdapter, TFile } from "obsidian";
import path from "path";
import { GARDEN_PATH, TRANSCLUDE_FOLDERS } from "./settings";

export function getApplicableFiles(plugin: MinExportPlugin) {
  const { vault, metadataCache } = plugin.app

  const files: TFile[] = []

  const seen = new Set<string>()
  const recurseReferencedFiles = (from: TFile) => {
    if (seen.has(from.path)) return

    const meta = metadataCache.getCache(from.path)
    if (!meta) return

    const refs = meta.embeds?.map(e => e.link) ?? []
    if (meta.frontmatterLinks) refs.push(...meta.frontmatterLinks.map(l => l.link))
    for (const link of refs) {
      const linkFile = metadataCache.getFirstLinkpathDest(link, from.path)
      if (!linkFile) continue

      if (linkFile?.parent && TRANSCLUDE_FOLDERS.includes(linkFile.parent.path)) {
        files.push(linkFile)
        recurseReferencedFiles(linkFile)
      }
    }
  }

  for (const file of vault.getMarkdownFiles()) {
    const meta = metadataCache.getCache(file.path)
    if (meta?.frontmatter == null) continue

    if (meta.frontmatter.publish !== true) continue

    files.push(file)
    recurseReferencedFiles(file)
  }

  return files
}

export async function syncGarden(plugin: MinExportPlugin, files: TFile[]) {
  const { vault } = plugin.app
  if (!(vault.adapter instanceof FileSystemAdapter)) return
  const root = vault.adapter.getBasePath()
  await fs.rm(GARDEN_PATH, { recursive: true })
  await fs.mkdir(GARDEN_PATH)


  await Promise.all(files.map(async file => {
    const out = path.join(GARDEN_PATH, file.path)
    await fs.mkdir(path.dirname(out), { recursive: true })
    await fs.copyFile(path.join(root, file.path), out)
  }))
}
