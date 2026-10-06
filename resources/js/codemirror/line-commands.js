import {EditorSelection} from '@codemirror/state'

export function joinLines(view) {
    const {state} = view

    if (state.readOnly) {
        return false
    }

    const transaction = state.update(state.changeByRange((range) => {
        const firstLine = state.doc.lineAt(range.from)
        let lastLine = state.doc.lineAt(range.to)

        if (range.empty || lastLine.number === firstLine.number) {
            if (firstLine.number === state.doc.lines) {
                return {range}
            }

            lastLine = state.doc.line(firstLine.number + 1)
        }

        const changes = []
        let cursor = null

        for (let number = firstLine.number; number < lastLine.number; number++) {
            const current = state.doc.line(number)
            const next = state.doc.line(number + 1)
            const leading = next.text.length - next.text.trimStart().length
            const separator = next.text.trim() === '' || current.text.trim() === '' ? '' : ' '

            changes.push({from: current.to, to: next.from + leading, insert: separator})
            cursor ??= current.to
        }

        const changeSet = state.changes(changes)

        return {changes: changeSet, range: EditorSelection.cursor(changeSet.mapPos(cursor, -1))}
    }), {scrollIntoView: true, userEvent: 'input'})

    view.dispatch(transaction)

    return true
}

export function toggleCase(view) {
    const {state} = view

    if (state.readOnly) {
        return false
    }

    const transaction = state.update(state.changeByRange((range) => {
        const target = range.empty ? state.wordAt(range.head) : range

        if (!target) {
            return {range}
        }

        const text = state.sliceDoc(target.from, target.to)
        const upper = text.toUpperCase()
        const replacement = upper !== text ? upper : text.toLowerCase()

        if (replacement === text) {
            return {range}
        }

        const changes = {from: target.from, to: target.to, insert: replacement}
        const delta = replacement.length - text.length

        return {
            changes,
            range: range.empty
                ? EditorSelection.cursor(range.head + delta)
                : EditorSelection.range(range.anchor, range.head + (range.head > range.anchor ? delta : 0)),
        }
    }), {scrollIntoView: true, userEvent: 'input'})

    view.dispatch(transaction)

    return true
}
