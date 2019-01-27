import { NgModule } from '@angular/core'
import { TerminalContextMenuItemProvider } from 'terminus-terminal'
import { SaveOutputContextMenu } from './contextMenu'

@NgModule({
    providers: [
        { provide: TerminalContextMenuItemProvider, useClass: SaveOutputContextMenu, multi: true },
    ],
})
export default class SaveOutputModule { }
