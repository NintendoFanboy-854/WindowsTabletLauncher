/*
using System.Text.Json;
using Microsoft.UI.Dispatching;
using OpenCvSharp;
using OpenCvSharp.Face;
using Windows.Graphics.Imaging;
using Windows.Media.FaceAnalysis;
using PluginContract;
using LauncherHost.Services;

namespace LauncherHost.Core.Agent;

public enum FaceAuthState { Idle, Detecting, FacesDetected, FacesLost }

public sealed class FaceAuthService : IDisposable
{
    readonly IHostHandle _host;
    readonly DispatcherQueue _dispatcher;

    FaceDetector? _detector;
    LBPHFaceRecognizer? _recognizer;

    List<string> _faceNames = new();
    bool _modelLoaded;

    FaceAuthState _state = FaceAuthState.Idle;
    int _consecutiveHits;
    int _consecutiveMisses;

    const int ConfidenceThreshold = 70;
    const int ConsecutiveHitsThreshold = 3;
    const int ConsecutiveMissesThreshold = 10;
    const int FaceImageSize = 100;

    public bool IsRegistered => _faceNames.Count > 0;
    public IReadOnlyList<string> FaceNames => _faceNames;
    public int RegisteredFaceCount => _faceNames.Count;
    public FaceAuthState State => _state;

    public event Action<FaceAuthState>? StateChanged;

    public FaceAuthService(IHostHandle host, DispatcherQueue dispatcher)
    {
        _host = host;
        _dispatcher = dispatcher;
    }

    public async Task<bool> InitializeAsync()
    {
        try
        {
            _detector = await FaceDetector.CreateAsync();
            LogService.Info("[FaceAuth] FaceDetector created");
        }
        catch (Exception ex)
        {
            LogService.Warn($"[FaceAuth] FaceDetector not available: {ex.Message}");
            _detector = null;
            return false;
        }

        LoadModel();
        return true;
    }

    public async Task<string?> ProcessFrameAsync(SoftwareBitmap bitmap)
    {
        if (_detector == null) return null;

        try
        {
            var faces = await _detector.DetectFacesAsync(bitmap);
            if (faces.Count == 0)
            {
                _consecutiveHits = 0;
                _consecutiveMisses++;
                if (_consecutiveMisses >= ConsecutiveMissesThreshold)
                    SetState(FaceAuthState.FacesLost);
                return null;
            }

            _consecutiveMisses = 0;

            var largest = faces[0];
            for (int i = 1; i < faces.Count; i++)
            {
                if (faces[i].FaceBox.Width * faces[i].FaceBox.Height
                    > largest.FaceBox.Width * largest.FaceBox.Height)
                    largest = faces[i];
            }

            if (!_modelLoaded)
            {
                _consecutiveHits++;
                if (_consecutiveHits >= ConsecutiveHitsThreshold)
                    SetState(FaceAuthState.FacesDetected);
                return "";
            }

            var faceMat = await ExtractFaceMatAsync(bitmap, largest.FaceBox);
            if (faceMat == null)
            {
                _consecutiveHits = 0;
                return null;
            }

            _recognizer!.Predict(faceMat, out var label, out var confidence);
            faceMat.Dispose();

            if (confidence < ConfidenceThreshold)
            {
                _consecutiveHits++;
                if (_consecutiveHits >= ConsecutiveHitsThreshold)
                    SetState(FaceAuthState.FacesDetected);
                return label >= 0 && label < _faceNames.Count ? _faceNames[label] : "";
            }
            else
            {
                _consecutiveHits = 0;
                return "";
            }
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[FaceAuth] ProcessFrame error");
            return null;
        }
    }

    public async Task<bool> RegisterAsync(List<SoftwareBitmap> frames, string name)
    {
        if (_detector == null || string.IsNullOrWhiteSpace(name))
        {
            LogService.Error("[FaceAuth] Register failed: no detector or empty name");
            return false;
        }

        var mats = new List<Mat>();
        foreach (var frame in frames)
        {
            try
            {
                var faces = await _detector.DetectFacesAsync(frame);
                if (faces.Count == 0) continue;

                var largest = faces[0];
                for (int i = 1; i < faces.Count; i++)
                {
                    if (faces[i].FaceBox.Width * faces[i].FaceBox.Height
                        > largest.FaceBox.Width * largest.FaceBox.Height)
                        largest = faces[i];
                }

                var mat = await ExtractFaceMatAsync(frame, largest.FaceBox);
                if (mat != null) mats.Add(mat);
            }
            catch (Exception ex)
            {
                LogService.Warn($"[FaceAuth] Register: frame skipped: {ex.Message}");
            }
        }

        if (mats.Count == 0)
        {
            LogService.Error("[FaceAuth] Register failed: no valid faces extracted");
            return false;
        }

        try
        {
            PersistFaceImages(name, mats);

            foreach (var m in mats) m.Dispose();

            _modelLoaded = true;
            LogService.Info($"[FaceAuth] registered '{name}' with {mats.Count} images");
            return true;
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[FaceAuth] Register: training failed");
            foreach (var m in mats) m.Dispose();
            return false;
        }
    }

    public async Task<bool> ReinforceAsync(List<SoftwareBitmap> frames, string name)
    {
        if (_detector == null || string.IsNullOrWhiteSpace(name))
            return false;

        var mats = new List<Mat>();
        foreach (var frame in frames)
        {
            try
            {
                var faces = await _detector.DetectFacesAsync(frame);
                if (faces.Count == 0) continue;
                var largest = faces[0];
                for (int i = 1; i < faces.Count; i++)
                    if (faces[i].FaceBox.Width * faces[i].FaceBox.Height > largest.FaceBox.Width * largest.FaceBox.Height)
                        largest = faces[i];
                var mat = await ExtractFaceMatAsync(frame, largest.FaceBox);
                if (mat != null) mats.Add(mat);
            }
            catch { }
        }

        if (mats.Count == 0) return false;

        try
        {
            var existingJson = _host.GetConfig("host", $"face_images.{name}");
            var existingList = string.IsNullOrWhiteSpace(existingJson)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(existingJson) ?? new();

            foreach (var mat in mats)
            {
                var bytes = mat.ToBytes(".jpg");
                existingList.Add(Convert.ToBase64String(bytes));
            }

            foreach (var m in mats) m.Dispose();

            _host.SetConfig("host", $"face_images.{name}", JsonSerializer.Serialize(existingList));
            ReloadModelFromAllFaces();
            LogService.Info($"[FaceAuth] reinforced '{name}' with {mats.Count} new images (total {existingList.Count})");
            return true;
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[FaceAuth] Reinforce failed");
            foreach (var m in mats) m.Dispose();
            return false;
        }
    }

    public void DeleteFace(string name)
    {
        _host.SetConfig("host", $"face_images.{name}", "");
        _faceNames.Remove(name);
        SaveFaceNames();
        LogService.Info($"[FaceAuth] deleted face '{name}'");

        ReloadModelFromAllFaces();
    }

    public void Reset()
    {
        _recognizer?.Dispose();
        _recognizer = null;
        _modelLoaded = false;
        _faceNames.Clear();
        _consecutiveHits = 0;
        _consecutiveMisses = 0;
        SetState(FaceAuthState.Idle);
        _host.SetConfig("host", "face_names", "");
        LogService.Info("[FaceAuth] reset");
    }

    void LoadModel()
    {
        try
        {
            var namesJson = _host.GetConfig("host", "face_names");
            _faceNames = string.IsNullOrWhiteSpace(namesJson)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(namesJson) ?? new();

            if (_faceNames.Count == 0)
            {
                LogService.Info("[FaceAuth] no saved faces");
                return;
            }

            ReloadModelFromAllFaces();
        }
        catch (Exception ex)
        {
            LogService.Error(ex, "[FaceAuth] LoadModel failed");
            _modelLoaded = false;
            _faceNames.Clear();
        }
    }

    void ReloadModelFromAllFaces()
    {
        _recognizer?.Dispose();
        _recognizer = null;
        _modelLoaded = false;

        if (_faceNames.Count == 0) return;

        var allMats = new List<Mat>();
        var allLabels = new List<int>();

        for (int label = 0; label < _faceNames.Count; label++)
        {
            var imagesJson = _host.GetConfig("host", $"face_images.{_faceNames[label]}");
            if (string.IsNullOrWhiteSpace(imagesJson)) continue;

            var base64List = JsonSerializer.Deserialize<List<string>>(imagesJson);
            if (base64List == null) continue;

            foreach (var b64 in base64List)
            {
                var bytes = Convert.FromBase64String(b64);
                var mat = Cv2.ImDecode(bytes, ImreadModes.Grayscale);
                if (mat != null && !mat.Empty())
                {
                    if (mat.Width != FaceImageSize || mat.Height != FaceImageSize)
                        mat = mat.Resize(new OpenCvSharp.Size(FaceImageSize, FaceImageSize));
                    allMats.Add(mat);
                    allLabels.Add(label);
                }
            }
        }

        if (allMats.Count == 0) return;

        _recognizer = LBPHFaceRecognizer.Create();
        _recognizer.Train(allMats, allLabels);

        foreach (var m in allMats) m.Dispose();

        _modelLoaded = true;
        LogService.Info($"[FaceAuth] model loaded: {_faceNames.Count} faces, {allMats.Count} images");
    }

    void PersistFaceImages(string name, IReadOnlyList<Mat> mats)
    {
        var base64List = new List<string>();
        foreach (var mat in mats)
        {
            var bytes = mat.ToBytes(".jpg");
            base64List.Add(Convert.ToBase64String(bytes));
        }

        var json = JsonSerializer.Serialize(base64List);
        _host.SetConfig("host", $"face_images.{name}", json);

        if (!_faceNames.Contains(name))
            _faceNames.Add(name);
        SaveFaceNames();
    }

    void SaveFaceNames()
    {
        var json = JsonSerializer.Serialize(_faceNames);
        _host.SetConfig("host", "face_names", json);
        LogService.Info($"[FaceAuth] saved face_names: {json}");
    }

    static async Task<Mat?> ExtractFaceMatAsync(SoftwareBitmap bitmap, BitmapBounds bounds)
    {
        try
        {
            int x = Math.Max(0, (int)bounds.X);
            int y = Math.Max(0, (int)bounds.Y);
            int w = Math.Min((int)bounds.Width, bitmap.PixelWidth - x);
            int h = Math.Min((int)bounds.Height, bitmap.PixelHeight - y);
            if (w <= 0 || h <= 0) return null;

            using var ms = new MemoryStream();
            var encoder = await BitmapEncoder.CreateAsync(BitmapEncoder.PngEncoderId, ms.AsRandomAccessStream());

            SoftwareBitmap encodeBmp;
            if (bitmap.BitmapPixelFormat != BitmapPixelFormat.Bgra8)
            {
                encodeBmp = SoftwareBitmap.Convert(bitmap, BitmapPixelFormat.Bgra8);
            }
            else
            {
                encodeBmp = bitmap;
            }

            encoder.SetSoftwareBitmap(encodeBmp);
            await encoder.FlushAsync();

            if (encodeBmp != bitmap)
                encodeBmp.Dispose();

            ms.Position = 0;
            var bytes = ms.ToArray();
            var mat = Cv2.ImDecode(bytes, ImreadModes.Color);
            if (mat == null || mat.Empty()) return null;

            var faceRect = new OpenCvSharp.Rect(x, y, w, h);
            var faceMat = new Mat(mat, faceRect);
            mat.Dispose();

            var gray = new Mat();
            Cv2.CvtColor(faceMat, gray, ColorConversionCodes.BGR2GRAY);
            faceMat.Dispose();

            var resized = gray.Resize(new OpenCvSharp.Size(FaceImageSize, FaceImageSize));
            gray.Dispose();

            Cv2.EqualizeHist(resized, resized);
            return resized;
        }
        catch (Exception ex)
        {
            LogService.Warn($"[FaceAuth] ExtractFaceMat: {ex.Message}");
            return null;
        }
    }

    void SetState(FaceAuthState state)
    {
        if (_state == state) return;
        _state = state;
        LogService.Info($"[FaceAuth] state: {state}");
        StateChanged?.Invoke(state);
    }

    public void Dispose()
    {
        _recognizer?.Dispose();
        _recognizer = null;
        _detector = null;
    }
}
*/
