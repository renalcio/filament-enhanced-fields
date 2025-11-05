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

    protected int|string|Closure|null $minHeight   = '10rem';
    protected int|string|Closure|null $maxHeight   = '50vh';
    protected string|null             $customStyle = null;
    protected bool                    $isReadOnly  = false;


    protected CodeLanguage|Closure|array|null $languages = null;

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

    public function CustomStyle(string|null $customStyle): static
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
        return $this->evaluate($this->showCopyButton ? "true" : "false");
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
