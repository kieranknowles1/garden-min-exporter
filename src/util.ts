import { FileSystemAdapter, Vault } from "obsidian";

export function getFilesystem(vault: Vault) {
  if (!(vault.adapter instanceof FileSystemAdapter)) throw new Error("Could not get filesystem adapter")
  return vault.adapter
}
