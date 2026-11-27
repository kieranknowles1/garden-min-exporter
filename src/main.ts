import {
	Notice,
	Plugin,
} from 'obsidian';
import {getApplicableFiles, syncGarden} from './exportVault';

export default class MinExportPlugin extends Plugin {
	async onload() {
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'export',
			name: 'Export',
			callback: async () =>  {
				try {
					const files = getApplicableFiles(this)
					await syncGarden(this, files)
					new Notice(`Exported ${files.length} files`)
				} catch (ex) {
					if (ex instanceof Error)
						new Notice(ex.message, 0)
				}
			},
		});
	}
}
