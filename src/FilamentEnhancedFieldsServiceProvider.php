<?php

declare(strict_types=1);

namespace Renalcio\FilamentEnhancedFields;

use Filament\Support\Assets\Asset;
use Filament\Support\Facades\FilamentAsset;
use Renalcio\FilamentEnhancedFields\Assets\HashedAlpineComponent;
use Renalcio\FilamentEnhancedFields\Assets\HashedCss;
use Spatie\LaravelPackageTools\Commands\InstallCommand;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentEnhancedFieldsServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-enhanced-fields';

    public static string $viewNamespace = 'filament-enhanced-fields';

    public function configurePackage(Package $package): void
    {

        $package->name(static::$name)
            ->hasCommands($this->getCommands())
            ->hasInstallCommand(function (InstallCommand $command): void {
                $command
                    ->publishConfigFile()
                    ->askToStarRepoOnGitHub('renalcio/filament-enhanced-fields');
            });

        $configFileName = $package->shortName();

        if (file_exists($package->basePath("/../config/{$configFileName}.php"))) {
            $package->hasConfigFile();
        }

        if (file_exists($package->basePath('/../resources/views'))) {
            $package->hasViews(static::$viewNamespace);
        }
    }

    public function packageRegistered(): void {}

    public function bootingPackage(): void
    {
        // Asset Registration
        FilamentAsset::register(
            $this->getAssets(),
            $this->getAssetPackageName()
        );

        FilamentAsset::registerScriptData(
            $this->getScriptData(),
            $this->getAssetPackageName()
        );
    }

    protected function getAssetPackageName(): ?string
    {
        return 'renalcio/filament-enhanced-fields';
    }

    /**
     * @return array<Asset>
     */
    protected function getAssets(): array
    {
        return [
            HashedAlpineComponent::make('filament-enhanced-code-editor', __DIR__.'/../resources/dist/js/code-editor-enhanced.js'),
            HashedCss::make('filament-enhanced-fields', __DIR__.'/../resources/dist/css/filament-enhanced-fields.css'),
            // Js::make('filament-enhanced-fields', __DIR__ . '/../resources/dist/js/filament-enhanced-fields.js'),
        ];
    }

    /**
     * @return array<class-string>
     */
    protected function getCommands(): array
    {
        return [
        ];
    }

    /**
     * @return array<string>
     */
    protected function getIcons(): array
    {
        return [];
    }

    /**
     * @return array<string>
     */
    protected function getRoutes(): array
    {
        return [];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getScriptData(): array
    {
        return [];
    }

    /**
     * @return array<string>
     */
    protected function getMigrations(): array
    {
        return [
        ];
    }
}
