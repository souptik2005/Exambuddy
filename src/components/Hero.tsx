import { motion } from "framer-motion";
import { Sparkles, Zap, Brain } from "lucide-react";

export function Hero() {
  return (
    <div className="text-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
          <Sparkles size={14} className="animate-pulse" />
          <span>AI-Powered Study Assistant</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9] uppercase">
          Master your <br />
          <span className="text-indigo-600 dark:text-indigo-400 italic font-light lowercase">notes</span> with ease.
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-xl mx-auto font-bold leading-relaxed">
          Transform messy PDFs and topics into structured guides, 
          MCQs, and key insights in seconds.
        </p>
      </motion.div>
    </div>
  );
}
