import { spawn, spawnSync } from 'child_process'
import MinExportPlugin from './main'
import { getFilesystem } from './util'
import { FileSystemAdapter, TFile } from 'obsidian'

export async function getMtime(filesystem: FileSystemAdapter, file: TFile) {
  return new Promise<Date>((resolve, reject) => {
    const root = filesystem.getBasePath()

    const proc = spawn('git', ['log', '-n', '1', '--date=iso', '--format=%ad', file.path], {
      cwd: root
    })

    var stdout = ""
    var stderr = ""
    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString() })
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString() })

    proc.on('error', reject)
    proc.on('close', code => {
      if (code !== 0) throw new Error(stderr)
      resolve(new Date(stdout))
    })
  })
}
