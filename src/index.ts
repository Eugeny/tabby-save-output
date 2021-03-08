import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import TerminusCoreModule, { ConfigProvider } from 'terminus-core'
import { TerminalContextMenuItemProvider, TerminalDecorator } from 'terminus-terminal'
import { SettingsTabProvider } from 'terminus-settings'

import { SaveOutputContextMenu } from './contextMenu'
import { SaveOutputConfigProvider } from './config'
import { SaveOutputSettingsTabProvider } from './settings'
import { SaveOutputSettingsTabComponent } from './settingsTab.component'
import { SaveOutputDecorator } from './decorator'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TerminusCoreModule,
    ],
    providers: [
        { provide: TerminalContextMenuItemProvider, useClass: SaveOutputContextMenu, multi: true },
        { provide: ConfigProvider, useClass: SaveOutputConfigProvider, multi: true },
        { provide: SettingsTabProvider, useClass: SaveOutputSettingsTabProvider, multi: true },
        { provide: TerminalDecorator, useClass: SaveOutputDecorator, multi: true },
    ],
    entryComponents: [
        SaveOutputSettingsTabComponent,
    ],
    declarations: [
        SaveOutputSettingsTabComponent,
    ],
})
export default class SaveOutputModule { }
