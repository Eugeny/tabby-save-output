import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import sanitizeFilename from 'sanitize-filename'
import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { TerminalDecorator, BaseTerminalTabComponent, BaseSession } from 'tabby-terminal'
import { SSHTabComponent } from 'tabby-ssh'
import { cleanupOutput } from './util'

@Injectable()
export class SaveOutputDecorator extends TerminalDecorator {
    constructor (
        private config: ConfigService,
    ) {
        super()
    }

    attach (tab: BaseTerminalTabComponent): void {
        if (this.config.store.saveOutput.autoSave === 'off' || this.config.store.saveOutput.autoSave === 'ssh' && !(tab instanceof SSHTabComponent)) {
            return
        }

        if (tab.sessionChanged$) { // v136+
            tab.sessionChanged$.subscribe(session => {
                if (session) {
                    this.attachToSession(session, tab)
                }
            })
        } else if (tab.session) {
            this.attachToSession(tab.session, tab)
        }
    }

    private attachToSession (session: BaseSession, tab: BaseTerminalTabComponent) {
        let outputPath = this.generatePath(tab)
        const stream = fs.createWriteStream(outputPath)
        let dataLength = 0

        // wait for the title to settle
        setTimeout(() => {
            let newPath = this.generatePath(tab)
            fs.rename(outputPath, newPath, err => {
                if (!err) {
                    outputPath = newPath
                }
            })
        }, 5000)

        session.output$.subscribe(data => {
            data = cleanupOutput(data)
            dataLength += data.length
            stream.write(data, 'utf8')
        })

        session.destroyed$.subscribe(() => {
            stream.close()
            if (!dataLength) {
                fs.unlink(outputPath, () => null)
            }
        })
    }

    private generatePath (tab: BaseTerminalTabComponent): string {
        let outputPath = this.config.store.saveOutput.autoSaveDirectory || os.homedir()
        let outputName = new Date().toISOString() + ' - ' + (tab.customTitle || tab.title || 'Untitled') + '.txt'
        outputName = sanitizeFilename(outputName)
        return path.join(outputPath, outputName)
    }
}
