using System.Reflection;
using System.Runtime.Loader;
using PluginContract;
using LauncherHost.Services;

namespace LauncherHost.Core;

public static class PluginLoader
{
    public record LoadResult
    {
        public List<IPlugin> Plugins { get; init; } = new();
        public List<IPluginSettings> Settings { get; init; } = new();
        public List<string> Errors { get; init; } = new();
    }

    public static LoadResult LoadAll(string pluginsDir, IHostHandle host)
    {
        var result = new LoadResult();

        var exeDir = Path.GetDirectoryName(Environment.ProcessPath);
        var fullPluginsDir = Path.IsPathFullyQualified(pluginsDir)
            ? pluginsDir
            : Path.Combine(exeDir ?? ".", pluginsDir);

        LogService.Info($"Scanning plugins directory: {fullPluginsDir}");

        if (!Directory.Exists(fullPluginsDir))
        {
            LogService.Warn($"Plugins directory not found: {fullPluginsDir}");
            return result;
        }

        foreach (var dllPath in Directory.GetFiles(fullPluginsDir, "*.dll"))
        {
            try
            {
                var asm = AssemblyLoadContext.Default.LoadFromAssemblyPath(dllPath);

                foreach (var type in asm.GetExportedTypes())
                {
                    if (type.IsAbstract || type.IsInterface) continue;
                    if (!typeof(IPlugin).IsAssignableFrom(type)) continue;

                    if (Activator.CreateInstance(type) is not IPlugin plugin) continue;

                    plugin.Initialize(host);
                    result.Plugins.Add(plugin);
                    LogService.Info($"Loaded plugin '{type.FullName}' from {Path.GetFileName(dllPath)}");

                    if (plugin is IPluginSettings settings)
                        result.Settings.Add(settings);

                    if (plugin is IAgentCapability cap)
                    {
                        host.RegisterAgentCapability(cap);
                        LogService.Info($"Registered agent capability for '{plugin.DisplayName}'");
                    }
                }
            }
            catch (Exception ex)
            {
                var msg = $"Failed to load plugin {Path.GetFileName(dllPath)}: {ex.Message}";
                result.Errors.Add(msg);
                LogService.Error(ex, msg);
            }
        }

        return result;
    }

    class PluginLoadContext : AssemblyLoadContext
    {
        public PluginLoadContext() : base(isCollectible: false) { }

        protected override Assembly? Load(AssemblyName name)
        {
            try { return Default.LoadFromAssemblyName(name); }
            catch { return null; }
        }
    }
}
