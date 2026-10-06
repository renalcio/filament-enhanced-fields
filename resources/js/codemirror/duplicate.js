import {EditorSelection} from '@codemirror/state'

export function duplicateLineOrSelection(view) {
    const {state} = view

    if (state.readOnly) {
        return false
    }

    view.dispatch(state.update(state.changeByRange((range) => {
        if (range.empty) {
            const line = state.doc.lineAt(range.head)

            return {
                changes: {from: line.to, insert: '\n' + line.text},
                range: EditorSelection.cursor(range.head + line.length + 1),
            }
        }

        const text = state.sliceDoc(range.from, range.to)

        return {
            changes: {from: range.to, insert: text},
            range: EditorSelection.range(range.to, range.to + text.length),
        }
    }), {scrollIntoView: true, userEvent: 'input'}))

    return true
}
