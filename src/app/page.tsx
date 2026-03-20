"use client";

import { useState } from "react";
import { Hero } from "@/components/Hero";
import { FileUploader } from "@/components/FileUploader";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ExamContent } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw } from "lucide-react";

export default function Home() {
  const [results, setResults] = useState<ExamContent | null>(null);

  const handleReset = () => {
    setResults(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <AnimatePresence mode="wait">
        {!results ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-12"
          >
            <Hero />
            <FileUploader onResults={setResults} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-4xl mx-auto px-4 pt-12 flex justify-between items-center">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                Your Study Guide
              </h2>
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
              >
                <RefreshCcw size={18} />
                <span>Try Another PDF</span>
              </button>
            </div>
            <ResultsDisplay results={results} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
        Built for Students with ❤️ and AI
      </footer>
    </main>
  );
}
