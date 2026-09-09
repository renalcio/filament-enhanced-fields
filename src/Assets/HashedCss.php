<?php

declare(strict_types=1);

namespace Renalcio\FilamentEnhancedFields\Assets;

use Filament\Support\Assets\Css;

/**
 * Mesmo motivo do `HashedAlpineComponent`: versiona a URL do CSS com um hash do
 * conteúdo publicado, em vez da versão fixa que o Composer relata pra um pacote
 * local (repositório `path`, sem tags — sempre "dev-main").
 */
class HashedCss extends Css
{
    public function getHref(): string
    {
        if ($this->isRemote()) {
            return $this->getPath();
        }

        return asset($this->getRelativePublicPath()).'?v='.$this->getContentVersion();
    }

    protected function getContentVersion(): string
    {
        $publicPath = $this->getPublicPath();

        if (! file_exists($publicPath)) {
            return $this->getVersion();
        }

        return substr(md5_file($publicPath), 0, 12);
    }
}
