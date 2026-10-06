import {EditorSelection} from '@codemirror/state'
import {toggleBlockComment} from '@codemirror/commands'

export const twigCommentTokens = {block: {open: '{#', close: '#}'}}

export function toggleBlockCommentByLine(view) {
    const {state} = view

    if (state.readOnly) {
        return false
    }

    if (state.selection.ranges.some((range) => range.empty)) {
        const ranges = state.selection.ranges.map((range) => {
            if (!range.empty) {
                return range
            }

            const line = state.doc.lineAt(range.head)
            const from = line.from + (line.text.length - line.text.trimStart().length)
            const to = line.to - (line.text.length - line.text.trimEnd().length)

            return from < to ? EditorSelection.range(from, to) : range
        })

        view.dispatch({selection: EditorSelection.create(ranges, state.selection.mainIndex)})
    }

    return toggleBlockComment(view)
}
