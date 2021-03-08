import { ConfigProvider } from 'terminus-core'

/** @hidden */
export class SaveOutputConfigProvider extends ConfigProvider {
    defaults = {
        saveOutput: {
            autoSave: 'off',
            autoSaveDirectory: null,
        },
    }

    platformDefaults = { }
}
