import { motion } from "framer-motion";
import { Sparkles, Zap, Brain } from "lucide-react";

export function Hero() {
  return (
    <div className="text-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-slate-50 uppercase">
          EFFORTLESS <span className="text-slate-400 font-light italic">LEARNING</span>
        </h1>
        
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Your minimal AI companion for transforming study materials 
          into structured guides and practice tests.
        </p>
      </motion.div>
    </div>
  );
}
