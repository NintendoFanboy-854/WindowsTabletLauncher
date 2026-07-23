/*
using Windows.Media.Capture;
using Windows.Media.Capture.Frames;
using Windows.Media.MediaProperties;
using Windows.Graphics.Imaging;
using Microsoft.UI.Dispatching;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Media.Imaging;
using LauncherHost.Services;

namespace LauncherHost.Core.Agent;

public sealed class CameraCapture : IDisposable
{
    MediaCapture? _capture;
    MediaFrameReader? _frameReader;
    SoftwareBitmapSource? _previewSource;
    Image? _previewImage;
    DispatcherQueue? _dispatcher;
    bool _capturing;
    int _frameArrivedCount;
    int _frameAcquiredCount;
    int _frameMissedCount;

    public bool IsCapturing => _capturing;

    public event Action<SoftwareBitmap>? FrameCaptured;

    public async Task<bool> StartAsync(Image? previewImage)
    {
        try
        {
            _capture = new MediaCapture();
            var settings = new MediaCaptureInitializationSettings
            {
                StreamingCaptureMode = StreamingCaptureMode.Video,
                SharingMode = MediaCaptureSharingMode.SharedReadOnly,
                MemoryPreference = MediaCaptureMemoryPreference.Cpu
            };
            await _capture.InitializeAsync(settings);

            var frameSource = _capture.FrameSources
                .FirstOrDefault(fs =>
                    fs.Value.Info.SourceKind == MediaFrameSourceKind.Color &&
                    (fs.Value.Info.MediaStreamType == MediaStreamType.VideoPreview ||
                     fs.Value.Info.MediaStreamType == MediaStreamType.VideoRecord))
                .Value;

            if (frameSource == null)
            {
                LogService.Error("[CameraCapture] no color video frame source");
                _capture.Dispose();
                _capture = null;
                return false;
            }

            if (previewImage != null)
            {
                _previewImage = previewImage;
                _dispatcher = previewImage.DispatcherQueue;
                _previewSource = new SoftwareBitmapSource();
                _previewImage.Source = _previewSource;
            }

            _frameReader = await CreateFrameReaderAsync(_capture, frameSource);
            _frameReader.FrameArrived += OnFrameArrived;
            await _frameReader.StartAsync();
            _capturing = true;

            _frameArrivedCount = 0;
            _frameAcquiredCount = 0;
            _frameMissedCount = 0;

            LogService.Info("[CameraCapture] started" + (previewImage != null ? " (with preview)" : " (no preview)"));
            return true;
        }
        catch (Exception ex)
        {
            LogService.Error($"[CameraCapture] start failed: {ex.Message}");
            _capturing = false;
            return false;
        }
    }

    static async Task<MediaFrameReader> CreateFrameReaderAsync(MediaCapture capture, MediaFrameSource source)
    {
        try
        {
            return await capture.CreateFrameReaderAsync(source, MediaEncodingSubtypes.Bgra8);
        }
        catch (Exception ex)
        {
            LogService.Warn($"[CameraCapture] Bgra8 reader failed ({ex.Message}), using native format");
            return await capture.CreateFrameReaderAsync(source);
        }
    }

    void OnFrameArrived(MediaFrameReader sender, MediaFrameArrivedEventArgs args)
    {
        _frameArrivedCount++;
        if (!_capturing) return;

        try
        {
            using var reference = sender.TryAcquireLatestFrame();
            if (reference == null)
            {
                _frameMissedCount++;
                return;
            }

            var bmp = reference.VideoMediaFrame?.SoftwareBitmap;
            if (bmp == null)
            {
                _frameMissedCount++;
                return;
            }

            _frameAcquiredCount++;

            if (_previewImage != null)
            {
                SoftwareBitmap previewCopy;
                if (bmp.BitmapPixelFormat != BitmapPixelFormat.Bgra8 ||
                    bmp.BitmapAlphaMode != BitmapAlphaMode.Premultiplied)
                {
                    previewCopy = SoftwareBitmap.Convert(bmp, BitmapPixelFormat.Bgra8, BitmapAlphaMode.Premultiplied);
                }
                else
                {
                    previewCopy = SoftwareBitmap.Copy(bmp);
                }

                _dispatcher?.TryEnqueue(async () =>
                {
                    try
                    {
                        await _previewSource!.SetBitmapAsync(previewCopy);
                    }
                    catch (Exception ex)
                    {
                        LogService.Warn($"[CameraCapture] SetBitmapAsync failed: {ex.Message}");
                    }
                    finally { previewCopy.Dispose(); }
                });
            }

            SoftwareBitmap grayBmp;
            if (bmp.BitmapPixelFormat != BitmapPixelFormat.Gray8)
                grayBmp = SoftwareBitmap.Convert(bmp, BitmapPixelFormat.Gray8);
            else
                grayBmp = SoftwareBitmap.Copy(bmp);

            FrameCaptured?.Invoke(grayBmp);

            if (_frameArrivedCount % 30 == 0)
                LogService.Info($"[CameraCapture] frames: arrived={_frameArrivedCount} acquired={_frameAcquiredCount} missed={_frameMissedCount}");
        }
        catch (Exception ex)
        {
            LogService.Error($"[CameraCapture] frame error: {ex.Message}");
        }
    }

    public async Task StopAsync()
    {
        _capturing = false;

        if (_frameReader != null)
        {
            _frameReader.FrameArrived -= OnFrameArrived;
            try { await _frameReader.StopAsync(); }
            catch (Exception ex) { LogService.Error($"[CameraCapture] StopAsync: {ex.Message}"); }
            _frameReader.Dispose();
            _frameReader = null;
        }

        if (_previewSource != null)
        {
            _previewImage!.Source = null;
            _previewSource = null;
        }

        if (_capture != null)
        {
            _capture.Dispose();
            _capture = null;
        }

        LogService.Info($"[CameraCapture] stopped (frames: arrived={_frameArrivedCount} acquired={_frameAcquiredCount} missed={_frameMissedCount})");
    }

    public void Stop()
    {
        _ = StopAsync();
    }

    public void Dispose()
    {
        _ = StopAsync();
    }
}
*/
