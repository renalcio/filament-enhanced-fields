import {foldAll, foldCode, unfoldAll, unfoldCode} from '@codemirror/language'

export function handleFoldShortcut(event, view) {
    if (!event.ctrlKey || event.altKey || event.metaKey) {
        return false
    }

    const isPlus = event.key === '+' || event.key === '=' || event.code === 'NumpadAdd'
    const isMinus = event.key === '-' || event.key === '_' || event.code === 'NumpadSubtract'

    if (!isPlus && !isMinus) {
        return false
    }

    event.preventDefault()

    if (event.shiftKey) {
        return isPlus ? unfoldAll(view) : foldAll(view)
    }

    return isPlus ? unfoldCode(view) : foldCode(view)
}
