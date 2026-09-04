'use client';

import { AppShell } from '@/components/shared/app-shell';
import { UploadBox } from '@/components/shared/upload-box';
import { ImagePreview } from '@/components/shared/image-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';
import { toast } from 'sonner';
import {
  ScanLine,
  Camera,
  ImageIcon,
  CheckCircle2,
  X,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { uploadInspection, getProduct } from '@/lib/mock-api';
import type { Product } from '@/lib/types';

function ScanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const [imageData, setImageData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (productId) {
      getProduct(productId).then(setProduct).catch(() => {});
    }
  }, [productId]);

  const handleFileSelected = (file: File, dataUrl: string) => {
    setImageData(dataUrl);
    setFileName(file.name);
  };

  const handleRemove = () => {
    setImageData(null);
    setFileName('');
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError('Camera access was denied or is not available on this device.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImageData(dataUrl);
    setFileName('camera-capture.jpg');
    stopCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleAnalyze = async () => {
    if (!imageData) return;
    setSubmitting(true);
    try {
      const { inspectionId } = await uploadInspection(
        product?.id ?? 'p1',
        imageData
      );
      toast.success('Image uploaded. Starting analysis…');
      router.push(`/analyzing/${inspectionId}?img=${encodeURIComponent(imageData)}`);
    } catch {
      toast.error('Failed to upload image. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Scan Product</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload or capture a product image to begin compliance inspection
          </p>
        </div>

        {/* Product context */}
        {product && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Inspecting: {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.brand} · {product.barcode}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!imageData && !cameraActive && (
          <div className="space-y-6">
            <UploadBox onFileSelected={handleFileSelected} />

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={startCamera}
            >
              <Camera className="h-5 w-5" />
              Use Camera
            </Button>

            {/* Instructions */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  Scan Tips for Best Results
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">·</span>
                    Ensure good lighting and the label is fully visible
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">·</span>
                    Capture the entire packaging including all text regions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">·</span>
                    Avoid glare, shadows, or motion blur
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">·</span>
                    Hold the camera steady and parallel to the label surface
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Camera capture */}
        {cameraActive && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 border-2 border-primary/40 rounded-xl pointer-events-none" />
                <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Camera Active
                </div>
              </div>
              {cameraError && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {cameraError}
                </p>
              )}
              <div className="flex gap-3">
                <Button onClick={capturePhoto} className="flex-1 gap-2">
                  <Camera className="h-5 w-5" />
                  Capture Photo
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>
        )}

        {/* Image selected state */}
        {imageData && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    {fileName}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemove} className="gap-1.5 h-8">
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
                <ImagePreview src={imageData} aspect="video" />
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAnalyze}
                disabled={submitting}
              >
                <Zap className="h-5 w-5" />
                {submitting ? 'Uploading…' : 'Analyze Product'}
              </Button>
              <Button variant="outline" size="lg" onClick={handleRemove}>
                Replace Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ScanPageContent />
    </Suspense>
  );
}
