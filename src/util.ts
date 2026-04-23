import stripAnsi from 'strip-ansi'

export function cleanupOutput (data: string): string {
    // OSC sequences: ESC ] ... BEL/ST
    data = data.replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '')
    // CSI sequences: ESC [ params final  (e.g. \e[01;32m, \e[2J, \e[?25l)
    data = data.replace(/\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]/g, '')
    // 2-char escape sequences: ESC <intermediate> <final>  (e.g. \e(B for G0 charset)
    data = data.replace(/\x1b[\x20-\x2f][\x30-\x7e]/g, '')
    // single-char escape sequences: ESC <final>  (e.g. \e=, \e>)
    data = data.replace(/\x1b[\x30-\x7e]/g, '')
    // orphaned CSI params (ESC consumed in previous chunk, params landed in this one)
    data = data.replace(/\[[0-9;?]*[A-Za-z]/g, '')
    // backspace
    data = data.replace(/\x08/g, '')
    return data
}
