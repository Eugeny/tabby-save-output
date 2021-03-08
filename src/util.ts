import stripAnsi from 'strip-ansi'

const regex = /[\x08\x1b]((\[\??\d+[hl])|([=<>a-kzNM78])|([\(\)][a-b0-2])|(\[\d{0,2}\w)|(\[\d+;\d+[hfy]?)|(\[;?[hf])|(#[3-68])|([01356]n)|(O[mlnp-z]?)|(\/Z)|(\d+)|(\[\?\d;\d0c)|(\d;\dR))/gi

export function cleanupOutput (data: string): string {
    return stripAnsi(data.replace(regex, ''))
}
