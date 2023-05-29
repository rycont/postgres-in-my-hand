import { Terminal as xterm } from 'xterm'
import { V86Starter } from '../lib/libv86.js'

function executeWithEmulator(emulator, _command) {
    return new Promise((ok) => {
        const command = _command.trim()
        const lines = command.split('\n').length

        let textBuffer = ''
        const rawBuffer = []

        const listener = (raw) => {
            rawBuffer.push(raw)

            const char = String.fromCharCode(raw)
            textBuffer += char
            console.log(textBuffer)

            if (textBuffer.endsWith('=#') || textBuffer.endsWith('-#')) {
                emulator.remove_listener('serial0-output-char', listener)
                const output = new TextDecoder('UTF-8').decode(
                    new Uint8Array(rawBuffer)
                )
                ok(
                    output
                        .replaceAll('[?2004l', ' ')
                        .replaceAll('[?2004h', '')
                        .split('\n')
                        .slice(lines, -1)
                        .join('\n')
                        .trim()
                )
            }
        }

        emulator.add_listener('serial0-output-raw', listener)
        emulator.serial_send_bytes(
            0,
            new TextEncoder('UTF-8').encode(`${command}\n`)
        )
    })
}

export let execute

export const createEmulator = async () => {
    const emulator = new V86Starter({
        wasm_path: './lib/v86.wasm',
        memory_size: 128 * 1024 * 1024,
        filesystem: {
            basefs: 'filesystem/filesystem.json',
            baseurl: 'filesystem/',
        },
        serial_container_xtermjs: document.getElementById('terminal'),
        xterm,
        network_relay_url: 'wss://relay.widgetry.org/',
        autostart: true,
        disable_keyboard: true,
        disable_mouse: true,
        disable_speaker: true,
        acpi: true,
        initial_state: { url: './state/v86state.bin.zst' },
    })

    await new Promise((ok) => {
        emulator.add_listener('emulator-ready', function () {
            window.emulator = emulator
            setTimeout(() => {
                const filename = `${(Math.random() + 1)
                    .toString(36)
                    .substring(7)}.sh`
                emulator.create_file(
                    `/inbox/${filename}`,
                    new TextEncoder('UTF-8').encode(
                        '/etc/init.d/S40network restart'
                    )
                )
                emulator.serial0_send(
                    `\\! stty rows ${emulator.serial_adapter.term.rows} cols ${emulator.serial_adapter.term.cols} && reset\n`
                )
                ok()
            }, 0)
        })
    })

    await new Promise((ok, fail) => {
        let buffer = ''

        const listener = (char) => {
            buffer += char
            if (buffer.endsWith('=#')) {
                emulator.remove_listener('serial0-output-char', listener)
                ok()
            }
        }

        emulator.add_listener('serial0-output-char', listener)
    })

    execute = (command) => executeWithEmulator(emulator, command)
    return execute
}
