"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processText, ExamContent } from "@/app/actions";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

interface FileUploaderProps {
  onResults: (results: ExamContent) => void;
}

export function FileUploader({ onResults }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs`;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const uint8Array = new Uint8Array(event.target.result as ArrayBuffer);
          const doc = await getDocument(uint8Array).promise;
          let text = "";
          for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(" ");
          }
          const results = await processText(text);
          console.log("Received results:", results);
          onResults(results);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 bg-white dark:bg-slate-900 shadow-sm">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-full text-indigo-600 dark:text-indigo-400">
            {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
          </div>
          
          <div>
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
              {file ? file.name : "Choose a PDF file or drag and drop"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Only PDF files up to 10MB"}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg flex items-center space-x-2 text-sm"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full mt-6 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Analyzing Study Material...</span>
          </>
        ) : (
          <>
            <FileText size={20} />
            <span>Generate Study Guide</span>
          </>
        )}
      </button>
    </div>
  );
}
