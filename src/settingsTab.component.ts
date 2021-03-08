/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component } from '@angular/core'
import { ConfigService, ElectronService, HostAppService } from 'terminus-core'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
})
export class SaveOutputSettingsTabComponent {
    constructor (
        public config: ConfigService,
        private electron: ElectronService,
        private hostApp: HostAppService
    ) { }

    async pickDirectory (): Promise<void> {
        const paths = (await this.electron.dialog.showOpenDialog(
            this.hostApp.getWindow(),
            {
                properties: ['openDirectory', 'showHiddenFiles'],
            }
        )).filePaths
        this.config.store.saveOutput.autoSaveDirectory = paths[0]
    }

}
