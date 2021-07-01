import * as fs from 'fs'
import { Injectable } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { MenuItemOptions } from 'tabby-core'
import { ElectronService, ElectronHostWindow } from 'tabby-electron'
import { BaseTerminalTabComponent, TerminalContextMenuItemProvider } from 'tabby-terminal'
import { cleanupOutput } from './util'

import './styles.scss'

@Injectable()
export class SaveOutputContextMenu extends TerminalContextMenuItemProvider {
    weight = 1

    constructor (
        private toastr: ToastrService,
        private electron: ElectronService,
        private hostWindow: ElectronHostWindow,
    ) {
        super()
    }

    async getItems (tab: BaseTerminalTabComponent): Promise<MenuItemOptions[]> {
        return [
            {
                label: 'Save output to file...',
                click: () => {
                    setTimeout(() => {
                        this.start(tab)
                    })
                }
            },
        ]
    }

    start (tab: BaseTerminalTabComponent) {
        if ((tab as any)._saveOutputActive) {
            return
        }

        let path = this.electron.dialog.showSaveDialogSync(
            this.hostWindow.getWindow(),
            { defaultPath: 'terminal-log.txt' }
        )

        if (!path) {
            return
        }

        let ui: HTMLElement = document.createElement('div')
        ui.classList.add('save-output-ui')
        tab.element.nativeElement.querySelector('.content').appendChild(ui)
        ui.innerHTML = require('./ui.pug')

        let stream = fs.createWriteStream(path)

        let subscription = tab.output$.subscribe(data => {
            data = cleanupOutput(data)
            stream.write(data, 'utf8')
        })

        ;(tab as any)._saveOutputActive = true

        ui.querySelector('button').addEventListener('click', () => {
            (tab as any)._saveOutputActive = false
            tab.element.nativeElement.querySelector('.content').removeChild(ui)
            subscription.unsubscribe()
            stream.end()
            this.toastr.info('File saved')
        })
    }
}
