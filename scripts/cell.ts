import { execute } from './emulator'

export class Cell {
    template = `
        <textarea class="query" autofocus rows="5"></textarea>
    `
    element: HTMLLabelElement

    constructor(addNewCell: () => void) {
        this.element = document.createElement('label')
        this.element.innerHTML = this.template
        this.element.className = 'cell'

        this.element.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && event.ctrlKey) {
                event.preventDefault()
                this.run()
            }

            if (event.key === 'Enter' && event.shiftKey) {
                event.preventDefault()
                this.run()
                addNewCell()
            }
        })
    }

    reset() {
        this.element.querySelector('.answer')?.remove()
        this.element.querySelector('.info')?.remove()
        ;[...this.element.getElementsByTagName('hr')].forEach((hr) =>
            hr.remove()
        )
    }

    async run() {
        const query = (
            this.element.querySelector('.query') as HTMLTextAreaElement
        ).value
        if (query.trim() === '') return

        this.reset()

        const info = document.createElement('div')
        info.className = 'info'

        const status = document.createElement('div')
        status.classList.add('status', 'running')
        status.appendChild(document.createTextNode('실행중..'))

        const time = document.createElement('div')
        time.className = 'time'
        const start = new Date()
        const startTimeString = `${start.getHours()}시 ${start.getMinutes()}분 ${start.getSeconds()}초`
        time.appendChild(document.createTextNode(startTimeString))

        info.appendChild(status)
        info.appendChild(time)

        this.element.insertBefore(info, this.element.querySelector('.query'))

        const hr = document.createElement('hr')
        this.element.insertBefore(hr, this.element.querySelector('.query'))

        const result = await execute(query)
        status.classList.remove('running')
        status.classList.add('done')
        status.innerHTML = '실행 완료'

        const answer = document.createElement('pre')
        answer.className = 'answer'
        answer.appendChild(document.createTextNode(result))

        const hr2 = document.createElement('hr')
        this.element.appendChild(hr2)
        this.element.appendChild(answer)

        const end = new Date()
        const diff = end.getTime() - start.getTime()
        const diffString =
            diff < 9999 ? `${diff}ms` : `${(diff / 1000).toFixed(1)}s`

        time.removeChild(time.firstChild!)
        time.appendChild(
            document.createTextNode(diffString + ' | ' + startTimeString)
        )
    }
}
