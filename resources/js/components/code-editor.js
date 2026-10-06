import {Compartment, EditorState, Prec} from '@codemirror/state'
import {basicSetup, EditorView} from 'codemirror'
import {indentWithTab} from '@codemirror/commands'
import {oneDark} from '@codemirror/theme-one-dark'
import {keymap} from '@codemirror/view'
import {vscodeKeymap} from '@replit/codemirror-vscode-keymap'
import {indentationMarkers} from '@replit/codemirror-indentation-markers'

import {cpp} from '@codemirror/lang-cpp'
import {css} from '@codemirror/lang-css'
import {go} from '@codemirror/lang-go'
import {html, htmlLanguage} from '@codemirror/lang-html'
import {java} from '@codemirror/lang-java'
import {javascript} from '@codemirror/lang-javascript'
import {json} from '@codemirror/lang-json'
import {markdown} from '@codemirror/lang-markdown'
import {php} from '@codemirror/lang-php'
import {python} from '@codemirror/lang-python'
import {sql} from '@codemirror/lang-sql'
import {xml} from '@codemirror/lang-xml'
import {yaml} from '@codemirror/lang-yaml'
import {sass} from '@codemirror/lang-sass'
import {twig} from './../codemirror/twig-lang.js'
import {toggleBlockCommentByLine, twigCommentTokens} from './../codemirror/comments.js'

// Import Expand Abbreviation command
import {
    abbreviationTracker,
    enterAbbreviationMode,
    expandAbbreviation,
    wrapWithAbbreviation
} from '@emmetio/codemirror6-plugin';


export default function codeEditorEnhancedFormComponent({
                                                            isDisabled,
                                                            isLive,
                                                            isLiveDebounced,
                                                            isLiveOnBlur,
                                                            liveDebounce,
                                                            language,
                                                            completions,
                                                            state,
                                                        }) {
    return {
        editor: null,
        themeCompartment: new Compartment(),
        isDocChanged: false,
        completions,
        state,

        init() {
            const languageExtension = this.getLanguageExtension()

            const debouncedCommit = Alpine.debounce(
                () => this.$wire.commit(),
                liveDebounce ?? 300,
            )

            this.editor = new EditorView({
                parent: this.$refs.editor,
                state: EditorState.create({
                    doc: this.state,
                    extensions: [
                        basicSetup,
                        abbreviationTracker(),
                        wrapWithAbbreviation('Ctrl-Shift-A'),
                        // Atalhos estilo VS Code (mover/duplicar linha, multi-cursor, busca, Mod-/
                        // pra comentar, Shift-Alt-A pra comentário em bloco, etc.) — mesmas
                        // funções de @codemirror/commands já usadas no resto do arquivo.
                        keymap.of(vscodeKeymap),
                        keymap.of([
                            indentWithTab,
                            {
                                key: 'Ctrl-e',
                                run: expandAbbreviation
                            },
                            {
                                key: 'Ctrl-Shift-e',
                                run: enterAbbreviationMode
                            }]),
                        EditorView.lineWrapping,
                        indentationMarkers(),
                        EditorState.readOnly.of(isDisabled),
                        EditorView.editable.of(!isDisabled),
                        EditorView.updateListener.of((viewUpdate) => {
                            if (!viewUpdate.docChanged) {
                                return
                            }
                            this.isDocChanged = true
                            this.state = viewUpdate.state.doc.toString()
                            if (!isLiveOnBlur && (isLive || isLiveDebounced)) {
                                debouncedCommit()
                            }
                        }),
                        EditorView.domEventHandlers({
                            blur: (event, view) => {
                                if (isLiveOnBlur && this.isDocChanged) {
                                    this.$wire.$commit()
                                }
                            },
                        }),
                        // Ctrl+Shift+/ comenta/descomenta em bloco (`{# #}` em HTML/Twig, `/* */` em CSS/JS).
                        // Não dá pra usar o `keymap.of([{key: 'Ctrl-Shift-/'}])` declarativo: o CodeMirror casa pelo
                        // caractere PRODUZIDO e o Shift+/ produz "?". Também não dá pra casar por `event.code`: no
                        // ABNT2 a tecla "/" é a `IntlRo` e o `Slash` físico é o ";". Por isso casamos "/" ou "?"
                        // (layouts onde "/" exige Shift) e a "/" do teclado numérico.
                        // `Prec.highest` garante que roda antes de qualquer keymap interno do basicSetup.
                        Prec.highest(EditorView.domEventHandlers({
                            keydown: (event, view) => {
                                const isSlashKey = event.key === '/' || event.key === '?' || event.code === 'NumpadDivide'

                                if (!event.ctrlKey || !event.shiftKey || event.altKey || !isSlashKey) {
                                    return false
                                }

                                event.preventDefault()

                                return toggleBlockCommentByLine(view)
                            },
                        })),
                        ...(languageExtension ? languageExtension : []),
                        //twig(),
                        this.themeCompartment.of(this.getThemeExtensions()),
                    ],
                }),
            })

            this.$watch('state', () => {
                if (this.state === undefined) {
                    return
                }

                if (this.editor.state.doc.toString() === this.state) {
                    return
                }

                this.editor.dispatch({
                    changes: {
                        from: 0,
                        to: this.editor.state.doc.length,
                        insert: this.state,
                    },
                })
            })

            this.themeObserver = new MutationObserver(() => {
                this.editor.dispatch({
                    effects: this.themeCompartment.reconfigure(
                        this.getThemeExtensions(),
                    ),
                })
            })

            this.themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            })
        },

        isDarkMode() {
            return document.documentElement.classList.contains('dark')
        },

        getThemeExtensions() {
            return this.isDarkMode() ? [oneDark] : []
        },

        getLanguageExtension() {
            if (!language) {
                return null
            }

            let retorno = null;

            const completionSource = this.buildCompletionSource()

            const extensions = {
                cpp,
                css,
                go,
                html,
                java,
                javascript,
                json,
                markdown,
                php,
                python,
                sql,
                xml,
                yaml,
                sass,
            }

            const resolveLanguage = (lang) => {
                if (lang === 'twig') {
                    return twig(completionSource)
                }

                const support = this.attachCompletionSource(extensions[lang]?.(), completionSource)

                if (lang === 'html' && support) {
                    return [support, htmlLanguage.data.of({commentTokens: twigCommentTokens})]
                }

                return support
            }

            //Verificar se a language é um array
            if (Array.isArray(language)) {
                retorno = language.map((lang) => resolveLanguage(lang) || null);
            }

            //Verificar se extensions tem a language
            if (typeof language === 'string' && (extensions[language] || language === 'twig')) {
                retorno = [resolveLanguage(language)]
            }

            return retorno;
        },

        // Fonte de completion compartilhada entre linguagens, a partir de uma lista arbitrária
        // de sugestões enviada pelo servidor via `completions` (ex.: funções de uma linguagem
        // customizada, identificadores de outros arquivos do projeto, etc).
        buildCompletionSource() {
            if (!this.completions || !this.completions.length) {
                return null
            }

            const options = this.completions.map((item) => ({
                label: item.label,
                type: item.type,
            }))

            return (context) => {
                const word = context.matchBefore(/[\w-]+/)

                if (!word || (word.from === word.to && !context.explicit)) {
                    return null
                }

                return {
                    from: word.from,
                    options,
                    validFor: /^[\w-]*$/,
                }
            }
        },

        // Anexa a fonte de completion a uma LanguageSupport via `language.data.of(...)` —
        // mecanismo idiomático do CodeMirror 6 pra ADICIONAR uma fonte sem reconfigurar o
        // `autocompletion()` global que o `basicSetup` já ativa.
        attachCompletionSource(support, completionSource) {
            if (!support || !completionSource) {
                return support
            }

            const language = support.language ?? support

            if (!language?.data?.of) {
                return support
            }

            return [support, language.data.of({autocomplete: completionSource})]
        },

        destroy() {
            if (this.themeObserver) {
                this.themeObserver.disconnect()
                this.themeObserver = null
            }

            if (this.editor) {
                this.editor.destroy()
                this.editor = null
            }
        },
    }
}
