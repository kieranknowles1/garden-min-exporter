import MinExportPlugin from "./main";
import { type MinExportSettings } from "./settings";
import { TFile } from "obsidian";

export default function getApplicableFiles(plugin: MinExportPlugin, config: MinExportSettings) {
  const { vault, metadataCache } = plugin.app

  const files: TFile[] = []
  for (const file of vault.getMarkdownFiles()) {
    const meta = metadataCache.getCache(file.path)
    if (meta?.frontmatter == null) continue

    if (!meta.frontmatter[config.frontmatterKey]) continue

    files.push(file)

    if (meta.embeds) {
      for (const embed of meta.embeds) {
        const embedFile = metadataCache.getFirstLinkpathDest(embed.link, file.path)
        if (!embedFile) continue

        if (embedFile?.parent && config.allowedTranscludeFolders.includes(embedFile.parent.path)) {
          files.push(embedFile)
        }
      }
    }
  }

  return files
}
