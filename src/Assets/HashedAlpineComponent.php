<?php

declare(strict_types=1);

namespace Renalcio\FilamentEnhancedFields\Assets;

use Filament\Support\Assets\AlpineComponent;

/**
 * O `AlpineComponent` padrão do Filament versiona a URL do asset (`?v=...`) com
 * `Composer\InstalledVersions::getVersion($package)`. Para um pacote local via
 * repositório `path` (como este, sem tags), isso sempre retorna algo fixo tipo
 * "dev-main" — a URL nunca muda entre commits, então o `Cache-Control: immutable`
 * do servidor faz o navegador/CDN reter uma cópia antiga do arquivo indefinidamente
 * mesmo depois de um novo `php artisan filament:assets`. Aqui a versão vira um hash
 * do conteúdo do arquivo publicado, que muda de verdade a cada atualização.
 */
class HashedAlpineComponent extends AlpineComponent
{
    public function getSrc(): string
    {
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
