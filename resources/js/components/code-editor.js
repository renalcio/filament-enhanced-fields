import {Compartment, EditorState} from '@codemirror/state'
import {basicSetup, EditorView} from 'codemirror'
import {indentWithTab} from '@codemirror/commands'
import {oneDark} from '@codemirror/theme-one-dark'
import {keymap} from '@codemirror/view'

import {cpp} from '@codemirror/lang-cpp'
import {css} from '@codemirror/lang-css'
import {go} from '@codemirror/lang-go'
import {html} from '@codemirror/lang-html'
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

// Import Expand Abbreviation command
import {
    abbreviationTracker,
    enterAbbreviationMode,
    expandAbbreviation,
    toggleComment,
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
                        keymap.of([
                            indentWithTab,
                            {
                                key: 'Ctrl-e',
                                run: expandAbbreviation
                            },
                            {
                                key: 'Ctrl-Shift-e',
                                run: enterAbbreviationMode
                            },
                            {
                                key: 'Ctrl-/',
                                run: toggleComment
                            }]),
                        EditorView.lineWrapping,
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
                            // Ctrl+Shift+/ pra comentar/descomentar. Não dá pra usar o `keymap.of([{key: 'Ctrl-Shift-/'}])`
                            // declarativo aqui: o CodeMirror casa pelo caractere PRODUZIDO (event.key), e em teclados
                            // US/ABNT o Shift+/ produz "?" (não "/"), então esse binding nunca bateria de verdade.
                            // Checando `event.code` (posição física da tecla) em vez do caractere, funciona independente
                            // do layout de teclado — e aceita tanto a "/" principal quanto a do teclado numérico.
                            keydown: (event, view) => {
                                const isSlashKey = event.code === 'Slash' || event.code === 'NumpadDivide'

                                if (!event.ctrlKey || !event.shiftKey || !isSlashKey) {
                                    return false
                                }

                                event.preventDefault()

                                return toggleComment(view)
                            },
                        }),
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

                return this.attachCompletionSource(extensions[lang]?.(), completionSource)
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

        // Fonte de completion compartilhada entre linguagens: funções/filtros/tags Twig,
        // classes CSS e símbolos JS do próprio tema (dados vindos do servidor via `completions`).
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
