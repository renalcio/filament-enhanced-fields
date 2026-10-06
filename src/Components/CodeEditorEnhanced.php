<?php

declare(strict_types=1);

namespace Renalcio\FilamentEnhancedFields\Components;

use Closure;
use Filament\Forms\Components\Field;
use Filament\Support\Concerns\HasExtraAlpineAttributes;
use Renalcio\FilamentEnhancedFields\Enums\CodeLanguage;

class CodeEditorEnhanced extends Field
{
    use HasExtraAlpineAttributes;

    protected string $view = 'filament-enhanced-fields::components.code-editor';

    protected int|string|Closure|null $minHeight = '10rem';

    protected int|string|Closure|null $maxHeight = '50vh';

    protected ?string $customStyle = null;

    protected bool $isReadOnly = false;

    protected CodeLanguage|Closure|array|null $languages = null;

    protected array|Closure|null $completions = null;

    protected bool|Closure $hasShortcuts = false;

    /**
     * @var array{format: ?string, compress: ?string, expand: ?string}
     */
    protected array $shortcutMethods = ['format' => null, 'compress' => null, 'expand' => null];

    public function setUp(): void
    {
        parent::setUp();

        $minHeight = $this->getMinHeight();
        $maxHeight = $this->getMaxHeight();

        $this->extraAttributes([
            'style' => "min-height: {$minHeight}; max-height: {$maxHeight}; overflow-y: auto;",
        ]);
    }

    public function languages(CodeLanguage|Closure|array|null $language): static
    {
        $this->languages = $language;

        return $this;
    }

    public function getLanguages(): string|array|null
    {
        $languages = $this->evaluate($this->languages);

        if ($languages instanceof CodeLanguage) {
            $languages = $languages->value;
        }

        return $languages;
    }

    public function completions(array|Closure|null $completions): static
    {
        $this->completions = $completions;

        return $this;
    }

    public function getCompletions(): array
    {
        return $this->evaluate($this->completions) ?? [];
    }

    /**
     * Ativa os atalhos de código do editor (opt-in): Mod-Alt-L formatar, Mod-Alt-M comprimir e Mod-Alt-E
     * expandir. Cada atalho dispara um evento DOM (`code-editor:format|compress|expand`, com o statePath
     * em `detail`) e, se configurado via onFormat()/onCompress()/onExpand(), chama o método Livewire.
     */
    public function shortcuts(bool|Closure $condition = true): static
    {
        $this->hasShortcuts = $condition;

        return $this;
    }

    public function onFormat(?string $livewireMethod): static
    {
        $this->shortcutMethods['format'] = $livewireMethod;

        return $this;
    }

    public function onCompress(?string $livewireMethod): static
    {
        $this->shortcutMethods['compress'] = $livewireMethod;

        return $this;
    }

    public function onExpand(?string $livewireMethod): static
    {
        $this->shortcutMethods['expand'] = $livewireMethod;

        return $this;
    }

    public function hasShortcuts(): bool
    {
        return (bool) $this->evaluate($this->hasShortcuts);
    }

    /**
     * @return array{format: ?string, compress: ?string, expand: ?string}
     */
    public function getShortcutMethods(): array
    {
        return $this->shortcutMethods;
    }

    public function CustomStyle(?string $customStyle): static
    {
        $this->customStyle = $customStyle;

        return $this;
    }

    public function maxHeight(int|string|Closure|null $minHeight = '50vh'): static
    {
        $this->minHeight = $minHeight;

        return $this;
    }

    public function minHeight(int|string|Closure|null $minHeight = '10rem'): static
    {
        $this->minHeight = $minHeight;

        return $this;
    }

    public function isReadOnly(bool $isReadOnly = false): static
    {
        $this->isReadOnly = $isReadOnly;

        return $this;
    }

    public function showCopyButton(bool $showCopyButton = true): static
    {
        $this->showCopyButton = $showCopyButton;

        return $this;
    }

    public function getIsReadOnly(): bool
    {
        return $this->evaluate($this->isReadOnly);
    }

    public function getShowCopyButton(): string
    {
        return $this->evaluate($this->showCopyButton ? 'true' : 'false');
    }

    public function getMinHeight(): null|int|string
    {
        return $this->evaluate($this->minHeight);
    }

    public function getMaxHeight(): null|int|string
    {
        return $this->evaluate($this->maxHeight);
    }

    public function getCustomStyle(): ?string
    {
        return $this->evaluate($this->customStyle);
    }
}
