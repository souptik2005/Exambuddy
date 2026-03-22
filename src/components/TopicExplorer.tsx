"use client";

import { useState } from "react";
import { Search, Loader2, Youtube, BookOpen, Lightbulb, AlertCircle, FileText, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTopicInfo } from "@/app/actions";
import { TopicSummary } from "@/app/types";

export function TopicExplorer() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TopicSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    setResult(null);
    setTopic("");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getTopicInfo(topic);
      if (data) {
        if (data.topic === "API Rate Limit Reached") {
          setError("I'm working too fast! Please wait a minute before searching again.");
        } else {
          setResult(data);
        }
      } else {
        setError("Could not find information for this topic. Please try another one.");
      }
    } catch (err: any) {
      if (err.message === "API_RATE_LIMIT") {
        setError("API limit reached. Please wait a moment.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="search-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card rounded-[2.5rem] p-12 shadow-2xl mb-10 transform transition-all hover:shadow-indigo-500/10"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                Curious about something?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Ask me anything, and I'll create a quick study guide for you.
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic name..."
                className="flex-1 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="px-10 py-4 bg-slate-900 dark:bg-slate-100 disabled:opacity-30 text-white dark:text-slate-900 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Explore</span>
                )}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-sm"
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="search-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <ArrowLeft size={20} />
                <span>Search again</span>
              </button>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                {result.topic}
              </h3>
              <div className="w-32 hidden sm:block" />
            </div>

            {/* Basic Summary Section */}
            <div className="glass-card rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <BookOpen size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-50">Basic Summary</h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg font-medium">
                {result.summary}
              </p>
            </div>
            
            {/* Detailed Explanation Section */}
            <div className="glass-card rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-2xl text-blue-600 dark:text-blue-400">
                  <FileText size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-50">Detailed Explanation</h4>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {result.detailedExplanation}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Key Points Section */}
              <div className="glass-card rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-2xl text-amber-600 dark:text-amber-400">
                    <Lightbulb size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-50">Key Points</h4>
                </div>
                <ul className="space-y-4">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* YouTube Section */}
              <div className="glass-card rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-2xl text-red-600 dark:text-red-400">
                    <Youtube size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-50">Recommended Videos</h4>
                </div>
                <div className="space-y-4">
                  {result.youtubeLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {link.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        Watch on YouTube
                        <Youtube size={12} />
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
