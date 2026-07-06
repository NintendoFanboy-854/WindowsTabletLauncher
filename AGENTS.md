# Agent Notes

## Environment

- **Python**: `C:\ProgramData\miniconda3\python.exe` — do not use system Python
- **.NET**: 10.0.301 SDK
- **Shell**: PowerShell 7.6.3 (all scripts `#Requires -PSEdition Core`)
- **OS**: Windows 10 21H2 (19044). WinApp CLI requires 19045, not available here
- **Display**: 2880×1920 @ 2x — effective resolution 1440×960 epx
- No Visual Studio required. WinUI templates installed via `dotnet new install Microsoft.WindowsAppSDK.WinUI.CSharp.Templates`

## Build & Run

```powershell
.\build-release.ps1    # Publishes all plugins + self-contained host → bin\Release\
.\launch.ps1           # Runs bin\Release\LauncherHost.exe (fails if not built)
```

No `.sln` — build per-project via csproj paths. `build-release.ps1` publishes each plugin, then the host, then copies plugin DLLs into `bin\Release\Plugins\` and trims all locale folders except en-US/zh-CN.

**Adding a new plugin**: you MUST add its name to the `$morePlugins` array in `build-release.ps1:28` — plugins are not auto-discovered by the build script.

Debug build (manual):
```powershell
dotnet build src/LauncherHost/LauncherHost.csproj -c Debug
dotnet build src/Plugins/<Name>/<Name>.csproj -c Debug
# Then copy <Name>.dll to LauncherHost debug output Plugins\ subdirectory
```

## Project Structure

```
src/
├── PluginContract/          # Plain .NET classlib (NO WinUI deps), IPlugin/IWidget/etc.
├── LauncherHost/            # WinUI 3 app, full-screen widget host
│   ├── Core/                # PluginLoader, GridLayoutManager, HostHandle, DesktopPage, HostAgentCapability
│   ├── Services/            # LogService, LocalizationService, ConfigStore, AcrylicBrushProvider
│   ├── Controls/            # SettingsDialog
│   └── Strings/             # en-us.json, zh-cn.json
└── Plugins/                 # each a WinUI classlib, dynamically loaded at runtime
    ├── ClockPlugin/
    ├── WeatherPlugin/
    ├── PomodoroPlugin/
    ├── SedentaryPlugin/
    └── TodoPlugin/
```

Target framework is `net10.0-windows10.0.26100.0` (build tooling), even though the runtime target OS is 19044 — see Environment.

## Critical csproj Settings

**LauncherHost.csproj** — these must not change:
- `WindowsAppSDKSelfContained=true` — no runtime framework package on 19044
- `PublishTrimmed=false` — plugin system uses reflection, trimming breaks it
- `WindowsPackageType=None` — unpackaged app
- `UseWinUI=true`, `WinUISDKReferences=false` — NuGet WinUI, not system SDK

**PluginContract.csproj** — plain `net10.0`, no WinUI reference. UI types are `object`.

**ClockPlugin.csproj** — `UseWinUI=true`, `WinUISDKReferences=false`, has `Microsoft.WindowsAppSDK` NuGet.

## Plugin Loading (hard-won)

The working approach after many failed attempts:

1. **`AssemblyLoadContext.Default.LoadFromAssemblyPath(dllPath)`** — this is what works. Do NOT use:
   - `Assembly.LoadFrom()` — fails on `System.Runtime` resolution in self-contained host
   - `AppDomain.AssemblyResolve` — does not fire reliably in .NET 10
   - `PublishSingleFile` — external DLLs can't resolve embedded host assemblies

2. **`GetExportedTypes()` works** once the loading approach is correct. The earlier `GetTypes()` + `ReflectionTypeLoadException` workaround was compensating for the wrong loading method.

3. **`Environment.ProcessPath`** for plugin directory discovery — NOT `AppContext.BaseDirectory`.

4. **Plugin DLL copy path**: `bin\Release\Plugins\ClockPlugin.dll` (alongside exe). Only the DLL is needed — no `.xbf` or `.pri` files.

## Plugin XAML / UserControl

WinUI's compiled XAML (`.xbf` files + `Application.LoadComponent`) does not work across AssemblyLoadContext boundaries. The working approach:
- Embed XAML markup as a C# string constant in the plugin
- Parse with `XamlReader.Load(xamlString)`
- Resolve `x:Name` elements with `parsedRoot.FindName()`, NOT `this.FindName()`
- Do NOT use `{ThemeResource}` in plugin XAML — use static colors
- Do NOT call the generated `InitializeComponent()` — write your own `LoadXaml()` instead

## Grid Layout System

- **Resolution**: Use `((FrameworkElement)Content).ActualWidth/Height` — these values are in effective pixels (epx). `AppWindow.ClientSize` returns physical pixels in FullScreen mode and is wrong.
- **ColumnSpacing = 0, RowSpacing = 0** — keep it simple
- **CellSize = width / Columns** — no gap subtraction
- Grid overlay lines, `SnapToGrid` step, and actual Grid column boundaries must all use the same `CellSize` value — if any of them use a different formula, the visual grid lines won't match the snap targets
- **Margin cache**: compute `Math.Max(2, CellSize * 0.04)` once after `Recalculate`, reuse in `ReapplyMargins` — floating-point jitter across recalculations causes margin accumulation
- `SizeChanged` handler must return early if a drag operation is in progress (`_dragTarget != null`), otherwise `Recalculate` destroys the Grid layout mid-drag

## Drag & Snap Algorithm

- Save widget grid-origin **before** switching `RenderTransform` to `TranslateTransform`
- In `DragCompleted`: `cursor = savedOrigin + dragOffset + pointerOffsetWithinWidget` — do NOT use `TransformToVisual` (it includes the TranslateTransform, double-counting the drag offset)
- `SnapToGrid` snaps cursor to nearest column line, then `targetCol = snapCol - dragRelCol` gives the widget's left edge

## Backdrop

- On Windows 10 (build < 22000), Mica/MicaAlt falls back to solid color. Use Acrylic (`DesktopAcrylicKind.Thin`) for visible effect.
- Acrylic uses `DesktopAcrylicController` (advanced API), not `DesktopAcrylicBackdrop` (no settings)

## Logging

All logs write to `%LocalAppData%\WindowsTabletLauncher\logs\` via `LogService.Info/Warn/Error`. Never use `Console.WriteLine` or `Debug.WriteLine` in production code.

## Key Interfaces

- `IPlugin`: `DisplayName`, `Initialize(IHostHandle)`, `GetWidgets()`, `Shutdown()`
- `IWidget`: `Id`, `Columns`, `Rows`, `Backdrop`, `CreateControl()` → `object`
- `IPluginSettings` (optional): `PluginId`, `CreateSettingsControl()` → `object`
- `IAgentCapability` (optional): `GetIntents()`, `CanHandle()`, `ExecuteAsync()`
- `IHostHandle`: `Translate(key)`, `GetConfig/SetConfig(pluginId,key,value)`, `RegisterAgentCapability(cap)`, `GetWidgetBackgroundBrush()`
