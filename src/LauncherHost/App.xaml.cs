using Windows.ApplicationModel;
using Windows.ApplicationModel.Activation;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Controls.Primitives;
using Microsoft.UI.Xaml.Data;
using Microsoft.UI.Xaml.Input;
using Microsoft.UI.Xaml.Media;
using Microsoft.UI.Xaml.Navigation;
using Microsoft.UI.Xaml.Shapes;
using LauncherHost.Services;

namespace LauncherHost;

/// <summary>
/// Provides application-specific behavior to supplement the default Application class.
/// </summary>
public partial class App : Application
{
    public static Window? MainWindow { get; private set; }
    private static Mutex? _singleInstanceMutex;
    private const string SingleInstanceMutexName = "WindowsTabletLauncher_SingleInstance_Mutex";

    public App()
    {
        if (!AcquireSingleInstance())
        {
            Environment.Exit(0);
            return;
        }

        InitializeComponent();
        UnhandledException += OnUnhandledException;
        AppDomain.CurrentDomain.UnhandledException += (_, e) =>
        {
            if (e.ExceptionObject is Exception ex)
                LogService.Error(ex, "AppDomain.UnhandledException (terminating=" + e.IsTerminating + ")");
            else
                LogService.Error("AppDomain.UnhandledException (terminating=" + e.IsTerminating + "): " + e.ExceptionObject);
            LogService.FlushNow();
        };
        TaskScheduler.UnobservedTaskException += (_, e) =>
        {
            LogService.Error(e.Exception, "TaskScheduler.UnobservedTaskException");
            e.SetObserved();
        };
    }

    void OnUnhandledException(object sender, Microsoft.UI.Xaml.UnhandledExceptionEventArgs e)
    {
        LogService.Error(e.Exception, $"App.UnhandledException: {e.Message}");
        LogService.FlushNow();
    }

    private static bool AcquireSingleInstance()
    {
        try
        {
            _singleInstanceMutex = new Mutex(true, SingleInstanceMutexName, out var createdNew);
            if (createdNew) return true;
            LogService.Error("Another launcher instance is already running; exiting.");
            return false;
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "Single-instance mutex acquisition failed");
            return true;
        }
    }

    protected override void OnLaunched(Microsoft.UI.Xaml.LaunchActivatedEventArgs args)
    {
        try
        {
            MainWindow = new MainWindow();
            MainWindow.Activate();
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "OnLaunched failed");
            LogService.FlushNow();
            throw;
        }
    }
}
