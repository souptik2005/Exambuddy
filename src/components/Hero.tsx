import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export function Hero() {
  return (
    <div className="text-center py-16 px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="inline-flex items-center justify-center p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-8 text-indigo-600 dark:text-indigo-300"
      >
        <GraduationCap size={48} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-4"
      >
        Exam Buddy AI
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
      >
        Turn your study notes and PDFs into structured study guides.
        Upload a file to get important questions and MCQs instantly.
      </motion.p>
    </div>
  );
}
