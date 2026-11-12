import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, Bot, ImagePlus, RotateCcw, Square, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn, fileToBase64Jpeg, initials } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const STORE = 'kinetiq.coach';
const PROMPTS = [
  ['Form check', 'What are the most common deadlift mistakes and how do I fix them?'],
  ['Plateau', 'My bench press has stalled for 4 weeks. What should I change?'],
  ['Recovery', 'How should I structure a deload week?'],
  ['Nutrition', 'What should I eat 1–2 hours before a morning workout?'],
];

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORE)) ?? []; } catch { return []; }
};

export default function Coach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState(load);
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(null);
  const endRef = useRef(null);
  const fileRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    // Persist text only (images are not stored).
    if (!streaming) localStorage.setItem(STORE, JSON.stringify(messages.slice(-40).map(({ role, content }) => ({ role, content }))));
  }, [messages, streaming]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text = input) => {
    const content = text.trim();
    if ((!content && !image) || streaming) return;
    const userMsg = { role: 'user', content: content || 'What is this equipment and how do I use it?', preview: image?.preview };
    const history = [...messages, userMsg];
    setMessages([...history, { role: 'model', content: '' }]);
    setInput('');
    const img = image;
    setImage(null);
    setStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await api.stream(
        '/api/ai/coach',
        {
          messages: history.slice(-20).map(({ role, content: c }) => ({ role, content: c })),
          image: img ? { data: img.data, mimeType: img.mimeType } : undefined,
        },
        {
          signal: ctrl.signal,
          onChunk: (t) => setMessages((m) => [...m.slice(0, -1), { role: 'model', content: t }]),
        },
      );
    } catch (e) {
      if (e.name !== 'AbortError') {
        toast.error(e.message);
        setMessages((m) => (m.at(-1)?.content ? m : m.slice(0, -1)));
      }
    } finally {
      setStreaming(false);
      taRef.current?.focus();
    }
  };

  const attach = async (file) => {
    if (!file?.type.startsWith('image/')) return;
    try { setImage(await fileToBase64Jpeg(file, 1024)); } catch { toast.error('Couldn’t read that image'); }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col lg:min-h-[calc(100dvh-6.5rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center rounded-2xl bg-volt text-ink-950">
            <Bot className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-ink-950 bg-volt" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-white">Coach</h1>
            <p className="text-xs text-ink-400">Training · nutrition · recovery · equipment</p>
          </div>
        </div>
        {!empty && (
          <Button variant="ghost" size="sm" onClick={() => { abortRef.current?.abort(); setMessages([]); }}><RotateCcw className="size-3.5" />New chat</Button>
        )}
      </div>

      <div className="flex-1">
        {empty ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-6">
              <span className="absolute inset-0 rounded-3xl bg-volt/25 blur-2xl" />
              <span className="relative grid size-16 place-items-center rounded-3xl border border-volt/30 bg-ink-900 text-volt"><Bot className="size-7" /></span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">What are we working on, {user.name.split(' ')[0]}?</h2>
            <p className="mt-2 max-w-md text-sm text-ink-300">Ask about technique, programming or food — or attach a photo of a machine for a setup walkthrough.</p>
            <div className="mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
              {PROMPTS.map(([tag, q], i) => (
                <motion.button
                  key={q}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  onClick={() => send(q)}
                  className="surface rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-volt/30"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-volt/80">{tag}</span>
                  <span className="mt-1 block text-sm text-ink-100">{q}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 pb-6">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                  <span className={cn('grid size-8 shrink-0 place-items-center rounded-xl text-xs font-bold', m.role === 'user' ? 'bg-white/[0.07] text-white' : 'bg-volt text-ink-950')}>
                    {m.role === 'user' ? initials(user.name) : <Bot className="size-4" />}
                  </span>
                  <div className={cn('min-w-0 max-w-[85%]', m.role === 'user' && 'flex flex-col items-end')}>
                    {m.preview && <img src={m.preview} alt="Attached" className="mb-2 max-h-56 rounded-2xl border border-white/10" />}
                    {m.role === 'user' ? (
                      <div className="rounded-2xl rounded-tr-md bg-white/[0.07] px-4 py-2.5 text-[14.5px] text-white">{m.content}</div>
                    ) : (
                      <div className="rounded-2xl rounded-tl-md border border-white/[0.06] bg-ink-900/70 px-4 py-3">
                        {m.content ? (
                          <div className="prose-k">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                            {streaming && i === messages.length - 1 && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-volt align-middle" />}
                          </div>
                        ) : (
                          <div className="flex gap-1 py-1.5" aria-label="Coach is typing">
                            {[0, 1, 2].map((d) => (
                              <motion.span key={d} className="size-1.5 rounded-full bg-ink-300" animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="sticky bottom-24 z-10 mx-auto w-full max-w-3xl lg:bottom-6">
        <div className="glass rounded-3xl p-2 shadow-[0_20px_60px_-20px_rgba(0,0,0,.8)]">
          <AnimatePresence>
            {image && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-2 pt-2">
                <div className="relative inline-block">
                  <img src={image.preview} alt="Attachment" className="h-20 rounded-xl border border-white/10 object-cover" />
                  <button onClick={() => setImage(null)} aria-label="Remove image" className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-ink-700 text-white"><X className="size-3" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-end gap-2">
            <button onClick={() => fileRef.current?.click()} aria-label="Attach photo" className="grid size-10 shrink-0 place-items-center rounded-2xl text-ink-300 transition hover:bg-white/5 hover:text-volt">
              <ImagePlus className="size-5" />
            </button>
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              onPaste={(e) => {
                const f = [...e.clipboardData.files].find((x) => x.type.startsWith('image/'));
                if (f) { e.preventDefault(); attach(f); }
              }}
              placeholder="Ask your coach…"
              maxLength={4000}
              className="max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2.5 text-[15px] text-white outline-none placeholder:text-ink-400"
            />
            {streaming ? (
              <button onClick={() => abortRef.current?.abort()} aria-label="Stop" className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"><Square className="size-4" /></button>
            ) : (
              <button onClick={() => send()} disabled={!input.trim() && !image} aria-label="Send" className="grid size-10 shrink-0 place-items-center rounded-2xl bg-volt text-ink-950 transition hover:bg-volt-soft disabled:opacity-30">
                <ArrowUp className="size-5" />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-500">Coach can make mistakes. Not medical advice.</p>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { attach(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </div>
  );
}
