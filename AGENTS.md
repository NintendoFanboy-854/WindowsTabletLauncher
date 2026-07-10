# Agent Notes

## Environment

- **Python**: `C:\ProgramData\miniconda3\python.exe` — do not use system Python
- **.NET**: 10.0.301 SDK
- **Shell**: PowerShell 7.6.3 (all scripts `#Requires -PSEdition Core`)
- **OS**: Windows 10 21H2 (19044). WinApp CLI requires 19045, not available here
- **Display**: 2880×1920 @ 2x — effective resolution 1440×960 epx
- No Visual Studio required.

## Build & Run

```powershell
.\build-release.ps1    # Publishes all plugins + self-contained host → bin\Release\
.\launch.ps1           # Runs bin\Release\LauncherHost.exe (fails if not built)
```

No `.sln` — build per-project via csproj paths. `build-release.ps1` builds PluginContract → SharedUtils → each plugin → host publish, copies plugin DLLs into `bin\Release\Plugins\`, trims all locale folders except en-US/zh-CN.

**Adding a new plugin**: add its name to `$morePlugins` array in `build-release.ps1:28`.

**Self-contained publish quirk**: `LauncherHost.csproj` already has `WindowsAppSDKSelfContained=true`. Do NOT pass `-p:WindowsAppSDKSelfContained=true` on the CLI — it propagates to SharedUtils (a class library) and breaks.

## Project Structure

```
src/
├── PluginContract/          # Plain .NET classlib (NO WinUI deps), IPlugin/IWidget/IAgentCapability/IHostHandle
├── SharedUtils/             # WinUI classlib, shared by all plugins + host
│   # MiniChart, BasePluginOverlay, AgentCapabilityBase, MarkdownRenderer (Markdig)
├── LauncherHost/            # WinUI 3 app, self-contained, full-screen widget host
│   ├── Core/                # PluginLoader, GridLayoutManager, HostHandle, DesktopPage, HostAgentCapability
│   │   └── Agent/           # AgentLoop, AgentService, AgentSession, DeepSeekClient, ConversationHistory, ToolRegistry, MemoryStore
│   ├── Services/            # LogService, LocalizationService, ConfigStore, AcrylicBrushProvider
│   ├── Controls/            # SettingsDialog
│   └── Strings/             # en-us.json, zh-cn.json
└── Plugins/                 # WinUI classlib, dynamically loaded via AssemblyLoadContext
    ├── ClockPlugin/         # Reference: PluginContract
    ├── WeatherPlugin/       # Reference: PluginContract
    ├── PomodoroPlugin/      # Reference: PluginContract + SharedUtils
    ├── SedentaryPlugin/     # Reference: PluginContract + SharedUtils
    └── TodoPlugin/          # Reference: PluginContract + SharedUtils
```

Target framework: `net10.0-windows10.0.26100.0`. PluginContract: plain `net10.0` (no WinUI).

NuGet: `Microsoft.WindowsAppSDK` 2.2.0, `Markdig` 0.40.0 (SharedUtils).

## Critical csproj Settings

**LauncherHost.csproj** — must not change:
- `WindowsAppSDKSelfContained=true` — no runtime framework package on 19044
- `PublishTrimmed=false` — plugin system uses reflection
- `WindowsPackageType=None` — unpackaged app
- `UseWinUI=true`, `WinUISDKReferences=false` — NuGet WinUI, not system SDK

**PluginContract.csproj** — plain `net10.0`, no WinUI reference. UI types are `object`.
**SharedUtils.csproj** — `net10.0-windows10.0.26100.0`, `UseWinUI=true`, `WinUISDKReferences=false`.

## Plugin Loading

`AssemblyLoadContext.Default.LoadFromAssemblyPath(dllPath)` — DO NOT use `Assembly.LoadFrom()` or `AppDomain.AssemblyResolve`. `GetExportedTypes()` works. Plugin DLL location: `Environment.ProcessPath` → `Plugins\` subdirectory.

## Plugin XAML

No compiled XAML in plugins. Build UI programmatically: `new Grid()`, `new StackPanel()`, `XamlReader.Load(xamlString)`. Do NOT use `{ThemeResource}`, `InitializeComponent()`, or `.xbf` files.

## Grid Layout System

- **Resolution**: `((FrameworkElement)Content).ActualWidth/Height` in effective pixels.
- **SubColumns/SubRows**: 2× the base Columns/Rows for fine-grained placement via `HalfColumns`/`HalfRows`.
- **SizeChanged → RelayoutGrid** must `return` early if `_dragTarget != null`.
- `IWidget.HalfColumns` / `IWidget.HalfRows` default to `Columns * 2` / `Rows * 2`.

## Drag System

Widgets stay in the Grid. Visual movement uses `TranslateTransform`. On completion:
- `targetCol = _dragOrigCol + Round(_dragTotalX / SubCell)`
- `targetRow = _dragOrigRow + Round(_dragTotalY / SubCell)`
- `TryPlace()` → if occupied, `GetSingleSwapTarget()` → if neither, snap back to original position.
- `OnWidgetDragStarted` and `OnWidgetDragDelta` must `return` early if `!_editMode`.

## Multi-Page System

- Pages created on demand via `GetOrCreatePage(index)`.
- **Edit mode ON**: if last page is non-empty, `AddPage()` adds an empty page. Saves/restores `Pager.SelectedIndex`.
- **Edit mode OFF**: `PruneEmptyPages()` removes trailing empty pages.
- **No cross-page dragging**: `OnWidgetDragCompleted` uses `_dragOrigPage`.
- **SettingsDialog page combo**: Guarded by `_rebuilding` flag. `RefreshPageCombos(pageCount, editMode)` called on edit toggle.

## Logging

`%LocalAppData%\WindowsTabletLauncher\logs\` via `LogService.Info/Warn/Error`. Never `Console.WriteLine`/`Debug.WriteLine`.

## Backdrop

Windows 10 (build < 22000): use `DesktopAcrylicController` (`DesktopAcrylicKind.Thin`). All widgets get brush via `_host.GetWidgetBackgroundBrush()`.

## Key Interfaces

- **`IPlugin`**: `DisplayName`, `Initialize(IHostHandle)`, `GetWidgets()`, `Shutdown()`
- **`IWidget`**: `Id`, `Columns`, `Rows`, `Backdrop`, `CreateControl()` → `object`, `HalfColumns`/`HalfRows`
- **`IPluginSettings`** (optional): `PluginId`, `CreateSettingsControl()` → `object`, `ResetConfig(IHostHandle)`
- **`IAgentCapability`** (optional): `GetTools()` → `IReadOnlyList<AgentTool>`, `InvokeAsync(tool, argsJson)` → `Task<string>`
- **`IHostHandle`**: `Translate(key)`, `GetConfig/SetConfig(pluginId,key,value)`, `RegisterAgentCapability(cap)`, `GetWidgetBackgroundBrush()`, `ShowNotification(title, msg, escalate)`, `Log/LogError`, `GetAllConfigs(keyPrefix)`

## Plugin Config Gotchas

- **`GetConfig` returns `""` not `null` after `SetConfig("", "")`**. ResetConfig MUST write defaults (`"true"`, `"60"`, etc.), not empty strings.
- **No `DeleteKey` in ConfigStore** — clear a key by setting it to default/empty value.
- **`IPluginSettings.ResetConfig(IHostHandle)`** is a default interface method — only plugins that store config need to override it.

## Agent System: Architecture

Agent messages flow through four layers:

```
AgentSession (UI — bubble, blocks, rendering, spinner)
  └─ AgentService (orchestration, history ownership, config)
      └─ AgentLoop (per-request: streaming, tool invocation, retry)
          └─ DeepSeekClient (HTTP + SSE parsing)
```

### Critical Rules

- **Agent callbacks (`onThinking`/`onContent`/`onToolStart`/`onToolResult`) run on HTTP thread**, not UI thread. ALL UI mutations MUST be wrapped in `DispatcherQueue.TryEnqueue(() => { ... })`.
- **WinUI silently swallows cross-thread UI access** — no exception, no crash, just no visual update.
- **`ConversationHistory` is owned by `AgentService`** (`_history = new()`), shared across all `AgentLoop` instances. Every new `SendAsync` passes the same history. `ClearHistory()` calls `_history.Clear()`.
- **MemoryStore** is persisted to `%LocalAppData%\WindowsTabletLauncher\memory.json`. Only writes when LLM calls `set_memory` tool.

### AgentSession: Block-Based Rendering

Output is no longer a fixed `thinking → tool → output` pipeline. Each `_curBlock` (StackPanel) holds a dynamic `List<BlockInfo>` of blocks in callback order:

```csharp
enum BlockType { Thinking, Tool, Output }

sealed class BlockInfo
{
    public BlockType Type;
    public UIElement Container;       // ScrollViewer(think) / TextBlock(tool) / Grid(output)
    public TextBlock? CollapsedPh;
    public string Text = "";
    public Brush PrimaryBrush, SecondaryBrush;
}
```

- `EnsureBlock(type)` creates a new block if the last block is a different type, or reuses the last block if same type.
- `CloseLastBlock()` finalizes collapsed placeholder text (e.g. "思考完毕").
- Thinking blocks render via `MarkdownRenderer.Render(text, secondary, secondary, 11)` (fontSize 11, gray).
- Output blocks render via `MarkdownRenderer.Render(text, primary, secondary)` (fontSize 13, primary color).
- `ApplyExpandMode` iterates `_allSubTurnBlocks` (snapshot copies of `_curBlocks` per message) + current `_curBlocks`, toggling visibility per block.

### AgentLoop: Retry on Empty Content

When the API returns thinking but no content (`response.Content == null && response.ThinkingContent != null`), `RunAsync` retries up to 3 times:
- `_retryAttempt++`, `turn--` (doesn't consume maxTurns), fires `OnRetry`
- After 3 failures, fires `OnRetryExhausted`
- AgentSession shows a blue tint (`#124090FF`) on `_curBlock` during retry, clears on completion
- `Send()` await dispatches `_thinkingActive = false; _toolActive = false` to stop spinner

### Agent Events Chain

```
AgentLoop.OnRetry → AgentService.OnAgentRetry → AgentSession (blue tint) + ShowNotification
AgentLoop.OnRetryExhausted → AgentService.OnAgentRetryExhausted → AgentSession (clear tint) + ShowNotification
AgentService.ExpandCotChanged → AgentSession.ApplyExpandMode (real-time toggle)
```

### Host Agent Tools

Defined in `MainWindow.xaml.cs:RegisterHostAgent()` — `set_expand_cot`, `exit_launcher`, `set_theme`, `set_language`, `set_edit_mode`, `set_notify_seconds`, `enable_plugin`, `disable_plugin`, `list_plugins`, `query_dashboard`, `set_memory`, `get_memory`, `clear_memory`. All handlers are `Func<string, string>` dispatched via `HostAgentCapability`.

## Markdown Rendering

`MarkdownRenderer.Render(text, primary, secondary, fontSize=13)` in SharedUtils uses Markdig (`UseAdvancedExtensions().DisableHtml()`) to parse Markdown and render to WinUI controls. Supports: `HeadingBlock`, `ParagraphBlock`, `CodeBlock`, `ListBlock`, `ThematicBreakBlock`, `QuoteBlock`, `Table` (with pipe/grid tables via `Markdig.Extensions.Tables`), and a `default` fallback that renders inline content as plain text.

## WinUI Gotchas

- **`FrameworkElement.MaxHeight = double.NaN` throws `ArgumentException`**. Use `double.PositiveInfinity` for "no maximum". This causes silent crashes because the try-catch in `EnsureSubTurn` swallows the exception, leaving `_curBlock` set but output controls uncreated — the user sees nothing.
- **All layout values are in effective pixels (epx)**. WinUI automatically handles DPI scaling via `XamlRoot.RasterizationScale`. No physical pixel conversions needed.
- **`DispatcherQueue.TryEnqueue` returns `bool`** — the return value is currently ignored. If it returns false, the callback is silently dropped.

## SettingsDialog Patterns

- **`_rebuilding` guard**: set `_rebuilding = true` before clearing/repopulating ComboBox items, `false` after. All `SelectionChanged` handlers must `if (_rebuilding) return;`.
- **`RefreshPageCombos(pageCount, editMode)`**: saves `SelectedIndex` before Clear, restores with `Math.Clamp`.
- **Expand/collapse toggle**: `SetupExpandCot()` reads `host.agent_expand_cot`, saves on toggle, fires `_onExpandCotChanged` callback → `AgentService.NotifyExpandCotChanged()` → `AgentSession.ApplyExpandMode()` (real-time).

## TodoPlugin UI Patterns

- **Priority colors**: `#F44336` (High), `#FF9800` (Medium), `#9E9E9E` (Low), `transparent` (None).
- **`lvi.Resources` override**: prevents default blue selection highlight from obscuring priority colors.

## Shared Utilities

- **`MiniChart.Bars/Line`** — self-drawn charts using WinUI Shapes.
- **`BasePluginOverlay`**: full-screen `Popup` with Acrylic card, `FadeIn`/`Scale` animations.
- **`AgentCapabilityBase`**: base class implementing `IAgentCapability` with `DispatcherQueue` → UI thread marshaling.
- **`StatsHelper`** (PluginContract): `TodayKey()`, `SlidingWindow()`, `PruneOldEntries()`, `HourlyBuckets()`.
- **`ConfigStore.GetAll()`**: returns all plugin config entries for cross-plugin aggregation (used by `DashboardPage`).
