import {html, htmlLanguage} from "@codemirror/lang-html"
import {foldInside, foldNodeProp, indentNodeProp, LRLanguage} from "@codemirror/language"

// Import the TWIG language extension
import {twigLanguage} from '@ssddanbrown/codemirror-lang-twig';
import {parseMixed} from "@lezer/common";
import {javascript} from "@codemirror/lang-javascript";
import {css} from "@codemirror/lang-css";


const mixedTwigParser = htmlLanguage.parser.configure({
    props: [
        // Add basic folding/indent metadata
        foldNodeProp.add({Conditional: foldInside}),
        indentNodeProp.add({
            Conditional: cx => {
                let closed = /^\s*\{% endif/.test(cx.textAfter)
                return cx.lineIndent(cx.node.from) + (closed ? 0 : cx.unit)
            }
        })
    ],
    wrap: parseMixed(node => {
        return node.type.isTop ? {
            parser: twigLanguage.parser,
            overlay: node => node.type.name == "Text"
        } : null
    })
})

const mixedTwigLanguage = LRLanguage.define({parser: mixedTwigParser})


const twigAutocompletion = twigLanguage.data.of({
    autocomplete: context => /* Twig completion logic here */ null
})

export function twig() {
    return [
        mixedTwigLanguage,
        html().support,
        javascript().support,
        css().support
    ]
}
