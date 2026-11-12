import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-ink-950 px-6 text-center">
      <div aria-hidden className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
      <div className="relative">
        <motion.p
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8 }}
          className="text-gradient font-mono text-[120px] font-semibold leading-none tracking-tighter sm:text-[180px]"
        >
          404
        </motion.p>
        <h1 className="mt-4 text-2xl font-semibold text-white">This page skipped leg day.</h1>
        <p className="mt-2 text-ink-300">It doesn’t exist — or it moved.</p>
        <Button to="/" variant="secondary" className="mt-8"><ArrowLeft className="size-4" />Back home</Button>
      </div>
    </div>
  );
}
