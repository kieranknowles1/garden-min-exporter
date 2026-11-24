import {
	Plugin,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	MinExportSettings,
	SampleSettingTab as MinExportSettingTab,
} from './settings';
import {getApplicableFiles, syncGarden} from './exportVault';

export default class MinExportPlugin extends Plugin {
	settings!: MinExportSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'export',
			name: 'Export Garden',
			callback: () => {
				const files = getApplicableFiles(this)
				console.log(files)
				syncGarden(this, files)
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new MinExportSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MinExportSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
