import { Cell } from './cell'
import { createEmulator } from './emulator'

const cellWrapper = document.getElementById('cell_wrapper')
const cells = []

const handlers = {
    addNewCell() {
        const cell = new Cell(handlers.addNewCell)

        cellWrapper.appendChild(cell.element)
        cells.push(cell)
        cell.element.firstElementChild.focus()
    },
}

;[...document.querySelectorAll('[data-onclick]')].forEach((element) => {
    const handlerName = element.dataset.onclick
    element.addEventListener('click', handlers[handlerName])
})

createEmulator().then(() => {
    document.getElementById('new_cell').classList.remove('hidden')
    document.getElementById('cell_wrapper').classList.remove('hidden')

    document.getElementById('loading').remove()
    handlers.addNewCell()
})
