"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { FileUploader } from "@/components/FileUploader";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { TopicExplorer } from "@/components/TopicExplorer";
import { HistorySidebar } from "@/components/HistorySidebar";
import { ExamContent, HistoryItem } from "@/app/types";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, FileText, Search, History, Menu, Sparkles, Zap } from "lucide-react";

export default function Home() {
  const [results, setResults] = useState<ExamContent | null>(null);
  const [activeMode, setActiveMode] = useState<"pdf" | "topic">("pdf");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("exambuddy_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleNewResults = (newResults: ExamContent) => {
    setResults(newResults);
    
    // Save to history
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      title: newResults.title || "Untitled Study Guide",
      date: new Date().toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      results: newResults
    };

    const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    setCurrentSessionId(newHistoryItem.id);
    localStorage.setItem("exambuddy_history", JSON.stringify(updatedHistory));
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setResults(item.results);
    setCurrentSessionId(item.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("exambuddy_history", JSON.stringify(updatedHistory));
    if (currentSessionId === id) {
      setResults(null);
      setCurrentSessionId(null);
    }
  };

  const handleReset = () => {
    setResults(null);
    setCurrentSessionId(null);
  };

  return (
    <main className="min-h-screen bg-background pb-24 relative overflow-x-hidden">
      {/* Background blobs for lively light feel */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-200/30 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-pink-200/30 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-amber-100/30 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <History size={20} />
            </button>
            
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
              <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
                EXAM<span className="text-indigo-600 dark:text-indigo-400 font-light">BUDDY</span><span className="text-indigo-600 dark:text-indigo-400">.</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {results ? (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 text-sm shadow-sm"
              >
                <span>New Guide</span>
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-full border border-border">v1.1</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <HistorySidebar
        history={history}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        currentId={currentSessionId || undefined}
      />

      <div className="pt-24">
        {/* Navigation Tabs */}
        {!results && (
          <div className="max-w-md mx-auto px-4 flex justify-center">
            <div className="p-1 rounded-2xl glass-card flex gap-1 w-full border border-border">
              <button
                onClick={() => setActiveMode("pdf")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeMode === "pdf"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText size={16} />
                <span>Study PDF</span>
              </button>
              <button
                onClick={() => setActiveMode("topic")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeMode === "topic"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Search size={16} />
                <span>AI Explorer</span>
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="pt-8"
            >
              <Hero />
              {activeMode === "pdf" ? (
                <FileUploader onResults={handleNewResults} />
              ) : (
                <TopicExplorer />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="pt-8"
            >
              <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center gap-6 mb-12">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative p-6 bg-primary text-primary-foreground rounded-[2rem] shadow-xl">
                    <FileText size={40} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-foreground tracking-tight leading-tight">
                    {results.title || "Your Study Guide"}
                  </h2>
                  <p className="text-base text-muted-foreground max-w-lg font-medium">
                    I've analyzed your notes and created this personalized study guide just for you.
                  </p>
                </div>
              </div>
              <ResultsDisplay results={results} onBack={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border py-4 text-center text-muted-foreground text-xs font-medium">
        Built with ❤️ for better learning
      </footer>
    </main>
  );
}
