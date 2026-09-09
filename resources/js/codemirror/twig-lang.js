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

export function twig(completionSource) {
    const htmlSupport = html()
    const jsSupport = javascript()
    const cssSupport = css()

    const extensions = [
        mixedTwigLanguage,
        htmlSupport.support,
        jsSupport.support,
        cssSupport.support,
    ]

    if (completionSource) {
        // twigLanguage é o parser usado como overlay dentro de nós de texto do HTML
        // (ver `wrap: parseMixed` acima), então anexar aqui faz o autocomplete resolver
        // corretamente a posição do cursor dentro de `{{ }}`/`{% %}`.
        extensions.push(
            twigLanguage.data.of({autocomplete: completionSource}),
            htmlSupport.language.data.of({autocomplete: completionSource}),
            jsSupport.language.data.of({autocomplete: completionSource}),
            cssSupport.language.data.of({autocomplete: completionSource}),
        )
    }

    return extensions
}
