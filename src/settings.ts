import { AbstractInputSuggest, App, FuzzySuggestModal, normalizePath, PluginSettingTab, Setting, SettingDefinitionItem, SuggestModal } from 'obsidian';
import MinExportPlugin from './main';

type Callback = (value: string) => Promise<void>
class FolderSuggestModal extends FuzzySuggestModal<string> {
	callback: Callback
	constructor(app: App, callback: Callback) {
		super(app)
		this.callback = callback
	}

	getItems(): string[] {
		return this.app.vault.getAllFolders().map(f => f.path)
	}
	getItemText(item: string): string {
		return item
	}
	onChooseItem(item: string, _evt: MouseEvent | KeyboardEvent): void {
		this.callback(item)
	}
}

export interface MinExportSettings {
	frontmatterKey: string,
	allowedTranscludeFolders: string[]
}

export const DEFAULT_SETTINGS: MinExportSettings = {
	frontmatterKey: "publish",
	allowedTranscludeFolders: [],
}

export class SampleSettingTab extends PluginSettingTab {
	plugin: MinExportPlugin;

	constructor(app: App, plugin: MinExportPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		let openAddFolder = () => {
			new FolderSuggestModal(this.app, async (folder) => {
				this.plugin.settings.allowedTranscludeFolders.push(folder)
				await this.plugin.saveSettings()
				this.update()
			}).open()
		}

		return [
			{
				name: "Frontmatter Key",
				control: {
					type: 'text',
					key: "frontmatterKey"
				}
			},
			{
				heading: "Allowed Transclude Folders",
				type: 'list',
				addItem: {
					name: "Add Folder",
					action: openAddFolder,
				},
				items: this.plugin.settings.allowedTranscludeFolders.map((path) => ({
					name: path,
					searchable: false
				})),
				onDelete: async (idx) => {
					this.plugin.settings.allowedTranscludeFolders.splice(idx, 1)
					await this.plugin.saveSettings()
					this.update()
				}
			}
		]
	}
}
