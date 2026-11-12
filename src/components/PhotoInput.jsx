import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, ImagePlus, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn, fileToBase64Jpeg } from '@/lib/utils';
import { Button } from './ui/Button';

/**
 * Photo picker with live camera (getUserMedia) + upload + drag & drop.
 * Calls onChange({ data, mimeType, preview }) or onChange(null).
 */
export function PhotoInput({ value, onChange, className, label = 'Drop a photo, upload, or use your camera' }) {
  const [cameraOn, setCameraOn] = useState(false);
  const [dragging, setDragging] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };
  useEffect(() => stopCamera, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      toast.error('Camera unavailable', { description: 'Allow camera access or upload a photo instead.' });
    }
  };

  const capture = async () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext('2d').drawImage(v, 0, 0);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.92));
    stopCamera();
    onChange(await fileToBase64Jpeg(blob));
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('That file isn’t an image');
    try {
      onChange(await fileToBase64Jpeg(file));
    } catch {
      toast.error('Couldn’t read that image', { description: 'Try a JPG or PNG.' });
    }
  };

  return (
    <div className={cn('relative overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900', className)}>
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative size-full">
            <img src={value.preview} alt="Selected" className="size-full object-cover" />
            <button onClick={() => onChange(null)} aria-label="Remove photo" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80">
              <X className="size-4" />
            </button>
          </motion.div>
        ) : cameraOn ? (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative size-full bg-black">
            <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" />
            <div className="pointer-events-none absolute inset-8">
              {['left-0 top-0 border-l-2 border-t-2 rounded-tl-xl', 'right-0 top-0 border-r-2 border-t-2 rounded-tr-xl', 'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-xl', 'right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl'].map((c) => (
                <span key={c} className={cn('absolute size-8 border-volt', c)} />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-5">
              <Button variant="secondary" size="icon" onClick={stopCamera} aria-label="Close camera"><X className="size-4" /></Button>
              <button onClick={capture} aria-label="Capture" className="grid size-16 place-items-center rounded-full border-4 border-white/80 transition active:scale-90">
                <span className="size-11 rounded-full bg-volt" />
              </button>
              <span className="size-9" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={cn('flex size-full flex-col items-center justify-center gap-5 p-8 text-center transition', dragging && 'bg-volt/[0.06]')}
          >
            <div className="relative">
              <span className="absolute inset-0 rounded-2xl bg-volt/20 animate-pulse-ring" />
              <div className="relative grid size-14 place-items-center rounded-2xl bg-volt/10 text-volt ring-1 ring-volt/30">
                <ImagePlus className="size-6" />
              </div>
            </div>
            <p className="max-w-[16rem] text-sm text-ink-300">{label}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><RefreshCw className="size-3.5 rotate-90" />Upload</Button>
              <Button size="sm" onClick={startCamera}><Camera className="size-3.5" />Camera</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}
