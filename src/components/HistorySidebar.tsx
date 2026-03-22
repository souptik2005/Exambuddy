"use client";

import { HistoryItem } from "@/app/types";
import { Clock, Trash2, X, ChevronRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HistorySidebarProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  currentId?: string;
}

export function HistorySidebar({ 
  history, 
  isOpen, 
  onClose, 
  onSelect, 
  onDelete,
  currentId 
}: HistorySidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="text-indigo-600 dark:text-indigo-400" size={20} />
                <h3 className="font-bold text-slate-900 dark:text-slate-50">Study History</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <FileText size={24} />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Your previous study guides will appear here!
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                      currentId === item.id
                        ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 shadow-sm"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                    }`}
                    onClick={() => onSelect(item)}
                  >
                    <div className={`p-2 rounded-lg ${
                      currentId === item.id 
                        ? "bg-indigo-600 text-white" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                      <FileText size={16} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold truncate ${
                        currentId === item.id ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-slate-100"
                      }`}>
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {item.date}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>

                    <ChevronRight size={14} className={`opacity-30 ${currentId === item.id ? "hidden" : "group-hover:opacity-100"}`} />
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                Exambuddy History
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
