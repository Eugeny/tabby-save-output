// VT escape sequences can be split across output$ emissions. Keep parser state
// per recording rather than trying to remove escape codes from each chunk alone.
const enum State {
    Text,
    Escape,
    EscapeIntermediate,
    Csi,
    ControlString,
    ControlStringEscape,
}

export function createOutputSanitizer (): (data: string) => string {
    let state = State.Text

    return (data: string): string => {
        let output = ''

        for (const character of data) {
            const code = character.charCodeAt(0)
            switch (state) {
                case State.Text:
                    if (code === 0x1b) {
                        state = State.Escape
                    } else if (code === 0x9b) { // 8-bit CSI
                        state = State.Csi
                    } else if (code === 0x90 || code === 0x98 || code === 0x9d ||
                               code === 0x9e || code === 0x9f) {
                        // 8-bit DCS, SOS, OSC, PM and APC
                        state = State.ControlString
                    } else if (code !== 0x08 && code !== 0x9c) {
                        // Drop backspace and 8-bit string terminator.
                        output += character
                    }
                    break

                case State.Escape:
                    if (character === '[') {
                        state = State.Csi
                    } else if (character === ']' || character === 'P' ||
                               character === 'X' || character === '^' || character === '_') {
                        // OSC, DCS, SOS, PM and APC
                        state = State.ControlString
                    } else if (code >= 0x20 && code <= 0x2f) {
                        state = State.EscapeIntermediate
                    } else if (code === 0x1b) {
                        state = State.Escape
                    } else {
                        // Ordinary two-byte ESC sequence, e.g. ESC 7 or ESC =.
                        state = State.Text
                    }
                    break

                case State.EscapeIntermediate:
                    if (code >= 0x30 && code <= 0x7e) {
                        state = State.Text
                    } else if (code === 0x1b) {
                        state = State.Escape
                    } else if (code < 0x20 || code > 0x2f) {
                        state = State.Text
                    }
                    break

                case State.Csi:
                    if (code >= 0x40 && code <= 0x7e) {
                        // CSI final byte. Includes SGR's 'm'.
                        state = State.Text
                    } else if (code === 0x1b) {
                        state = State.Escape
                    } else if (code < 0x20 || code > 0x3f) {
                        // Cancel malformed sequences without swallowing more text.
                        state = State.Text
                        if (code === 0x0a || code === 0x0d) {
                            output += character
                        }
                    }
                    break

                case State.ControlString:
                    if (code === 0x07 || code === 0x9c) {
                        // BEL or 8-bit ST terminates an OSC/control string.
                        state = State.Text
                    } else if (code === 0x1b) {
                        state = State.ControlStringEscape
                    }
                    break

                case State.ControlStringEscape:
                    if (character === '\\' || code === 0x9c || code === 0x07) {
                        // ESC \\ is the standard 7-bit string terminator.
                        state = State.Text
                    } else if (code !== 0x1b) {
                        state = State.ControlString
                    }
                    break
            }
        }

        return output
    }
}

// Preserve the original one-shot API for other callers.
export function cleanupOutput (data: string): string {
    return createOutputSanitizer()(data)
}
