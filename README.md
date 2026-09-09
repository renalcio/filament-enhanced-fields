# Filament Enhanced Fields

[![Latest Version on Packagist][ico-version]][link-packagist]
[![Total Downloads][ico-downloads]][link-downloads]
[![Software License][ico-license]][link-license]

A small pack of enhanced form fields for [Filament](https://filamentphp.com). Currently ships a **CodeMirror 6** powered code editor field (`CodeEditorEnhanced`), built for editing real source files (not just a "pretty textarea") from inside a Filament panel.

## Features

- **CodeMirror 6** under the hood — no CDN dependency, bundled with the package.
- **Multi-language syntax highlighting**: CSS, Sass/SCSS, HTML, Twig, JavaScript, JSON, PHP, Python, Java, Go, C++, SQL, XML, YAML, Markdown.
- **Twig-in-HTML** mixed-language mode, so `.twig`/`.html` templates get proper highlighting both in the markup and inside `{{ }}` / `{% %}` regions, including embedded `<script>`/`<style>` blocks.
- **Emmet** abbreviation expansion (`Ctrl-E` to expand, `Ctrl-Shift-E` to enter abbreviation mode, `Ctrl-Shift-A` to wrap the selection).
- **Comment toggling** (`Ctrl-/` and `Ctrl-Shift-/`, both main-row and numpad `/`), matched by physical key position so it works regardless of keyboard layout.
- **Dark mode** that automatically follows Tailwind's `.dark` class on `<html>` — no extra wiring needed.
- **Custom autocomplete**: feed the field a list of arbitrary suggestions (functions, symbols, identifiers — from your own app, a database, another file, whatever) and they show up in CodeMirror's completion popup alongside each language's native completions.
- Supports Filament's standard `hintActions()`, `live()`, and other `Field` conveniences out of the box.

## Installation

```bash
composer require renalcio/filament-enhanced-fields
```

## Basic Usage

```php
use Renalcio\FilamentEnhancedFields\Components\CodeEditorEnhanced;
use Renalcio\FilamentEnhancedFields\Enums\CodeLanguage;

CodeEditorEnhanced::make('content')
    ->languages(CodeLanguage::Php)
    ->minHeight('20rem')
    ->maxHeight('60vh')
    ->columnSpanFull(),
```

`languages()` also accepts an array, to load more than one language extension into the same editor instance (useful for templates that mix markup with embedded script/style):

```php
CodeEditorEnhanced::make('content')
    ->languages([CodeLanguage::Html, CodeLanguage::JavaScript, CodeLanguage::Css]),
```

### Supported languages

`Renalcio\FilamentEnhancedFields\Enums\CodeLanguage` — `Cpp`, `Css`, `Sass`, `Go`, `Html`, `Twig`, `Java`, `JavaScript`, `Json`, `Markdown`, `Php`, `Python`, `Sql`, `Xml`, `Yaml`.

### Custom autocomplete

Pass a flat array (or a `Closure` returning one) of suggestions via `completions()`. Each item needs a `label` and a `type` (used for the icon/grouping in CodeMirror's completion list — e.g. `function`, `variable`, `class`, `filter`, `tag`, or any other short label):

```php
CodeEditorEnhanced::make('content')
    ->languages(CodeLanguage::Twig)
    ->completions(fn () => [
        ['label' => 'dd', 'type' => 'function'],
        ['label' => 'ProcessedRefund', 'type' => 'class'],
        ['label' => 'App\\Models\\Order', 'type' => 'variable'],
    ]),
```

These are merged with — not a replacement for — each language's own built-in completions (e.g. CSS property/value suggestions, HTML tag names). Build the list from whatever's relevant to your app: reflected functions/filters from a template engine, symbols scanned out of other project files, a static list, database-backed snippets, etc.

### Live updating & save shortcut

The field entangles its state two-way, so it plays well with `->live()` and with Filament `Action`s that read/write the field's value via `Get`/`Set` (e.g. a "Save" action bound to `Ctrl+Shift+S` via `->keyBindings([...])`) — external changes to the state are reflected back into the editor automatically.

### Sizing

```php
CodeEditorEnhanced::make('content')
    ->minHeight('10rem') // default
    ->maxHeight('50vh'), // default
```

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Tab` | Indent |
| `Ctrl+E` | Expand Emmet abbreviation |
| `Ctrl+Shift+E` | Enter Emmet abbreviation mode |
| `Ctrl+Shift+A` | Wrap selection with abbreviation |
| `Ctrl+/` or `Ctrl+Shift+/` | Toggle line/block comment |

## License

This package is distributed under the [MIT License][link-license].

## Security

If you encounter any security-related issues, please report them via the [GitHub issue tracker][link-github-issue].

## Contribution

Contributions are welcome:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

[ico-version]: https://img.shields.io/packagist/v/renalcio/filament-enhanced-fields.svg?style=flat-square
[ico-license]: https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square
[ico-downloads]: https://img.shields.io/packagist/dt/renalcio/filament-enhanced-fields.svg?style=flat-square

[link-packagist]: https://packagist.org/packages/renalcio/filament-enhanced-fields
[link-license]: https://github.com/renalcio/filament-enhanced-fields/blob/main/LICENSE.md
[link-downloads]: https://packagist.org/packages/renalcio/filament-enhanced-fields
[link-github-issue]: https://github.com/renalcio/filament-enhanced-fields/issues
