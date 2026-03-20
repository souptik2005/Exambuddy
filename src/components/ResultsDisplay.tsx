"use client";

import { useState } from "react";
import { ExamContent } from "@/app/actions";
import { CheckCircle2, Circle, GraduationCap, ListChecks } from "lucide-react";
import { motion } from "framer-motion";

import { formatAnswer } from "@/lib/format";

interface ResultsDisplayProps {
  results: ExamContent;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<"questions" | "mcqs">("questions");

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="flex justify-center space-x-4 mb-10">
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transition-all ${
            activeTab === "questions"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
          }`}
        >
          <GraduationCap size={20} />
          <span>Important Questions</span>
        </button>
        <button
          onClick={() => setActiveTab("mcqs")}
          className={`px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transition-all ${
            activeTab === "mcqs"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
          }`}
        >
          <ListChecks size={20} />
          <span>MCQs</span>
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "questions" ? (
          results.importantQuestions.map((q, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
                <span className="text-indigo-600 mr-2">{idx + 1}.</span> {q.question}
              </h3>
              <div
                className="text-slate-600 dark:text-slate-400 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30"
                dangerouslySetInnerHTML={{ __html: formatAnswer(q.answer) }}
              />
            </motion.div>
          ))
        ) : (
          results.mcqs.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
                <span className="text-indigo-600 mr-2">{idx + 1}.</span> {m.question}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {m.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-4 rounded-xl border flex items-center space-x-3 ${
                      opt === m.answer
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300"
                        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {opt === m.answer ? (
                      <CheckCircle2 size={20} className="shrink-0" />
                    ) : (
                      <Circle size={20} className="shrink-0 opacity-20" />
                    )}
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
