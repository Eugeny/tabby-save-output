import { ConfigProvider } from 'tabby-core'

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
