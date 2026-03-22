"use client";

import { useState, useEffect } from "react";
import { Upload, Loader2, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { processText } from "@/app/actions";
import { ExamContent } from "@/app/types";
import { createWorker } from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

interface FileUploaderProps {
  onResults: (results: ExamContent) => void;
}

export function FileUploader({ onResults }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs`;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isPdf = selectedFile.type === "application/pdf";
      const isImage = selectedFile.type.startsWith("image/");
      
      if (isPdf || isImage) {
        setFile(selectedFile);
        setError(null);
        setStatus(isImage ? "Great photo! I'll read the text from it." : "Nice! That's a great PDF. Ready when you are!");
      } else {
        setError("Oops! I can only read PDFs or Images (JPG, PNG).");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(0);
    setStatus(file.type.startsWith("image/") ? "Reading your image... hang tight!" : "Scanning your notes... hang tight!");

    try {
      let fullText = "";

      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            if (event.target?.result) {
              const uint8Array = new Uint8Array(event.target.result as ArrayBuffer);
              const pdf = await getDocument(uint8Array).promise;

              // Step 1: Attempt standard text extraction
              for (let i = 1; i <= pdf.numPages; i++) {
                setStatus(`Reading page ${i} of ${pdf.numPages}...`);
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items
                  .map((item: any) => item.str)
                  .join(" ");
                fullText += pageText + "\n";
                setProgress(Math.round((i / pdf.numPages) * 100));
              }

              // Step 2: Automatic OCR if extraction fails (likely scanned/handwritten)
              if (fullText.trim().length < 50) {
                setStatus("These look like handwritten notes! Starting OCR scan...");
                const worker = await createWorker('eng', 1, {
                  logger: m => {
                    if (m.status === 'recognizing text') {
                      setProgress(Math.round(m.progress * 100));
                    }
                  }
                });
                
                fullText = ""; // Clear for OCR run
                for (let i = 1; i <= pdf.numPages; i++) {
                  setStatus(`Scanning handwritten page ${i} of ${pdf.numPages}...`);
                  const page = await pdf.getPage(i);
                  const viewport = page.getViewport({ scale: 3.0 }); 
                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d');
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;

                  await (page as any).render({ canvasContext: context!, viewport }).promise;
                  
                  const { data: { text } } = await worker.recognize(canvas);
                  fullText += text + "\n";
                }
                await worker.terminate();
              }
              await finishProcessing(fullText);
            }
          } catch (err: any) {
            setError(err.message || "Failed to process PDF.");
            setLoading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type.startsWith("image/")) {
        // Image processing
        try {
          setStatus("Transcribing your image with OCR...");
          const worker = await createWorker('eng', 1, {
            logger: m => {
              if (m.status === 'recognizing text') {
                setProgress(Math.round(m.progress * 100));
              }
            }
          });
          
          const { data: { text } } = await worker.recognize(file);
          fullText = text;
          await worker.terminate();
          await finishProcessing(fullText);
        } catch (err: any) {
          setError("Failed to read text from image. Please try a clearer photo.");
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const finishProcessing = async (text: string) => {
    setStatus("Thinking... Finding the best questions for you!");
    const results = await processText(text);
    
    if (!results || (results.importantQuestions.length === 0 && results.mcqs.length === 0)) {
        setError("Hmm, I couldn't find any readable text in that file. Please try a clearer one.");
      } else if (results.importantQuestions.length > 0 && results.importantQuestions[0].question === "API Rate Limit Reached") {
        setError("I've reached my daily limit! Please try again in a few minutes.");
      } else if (results.importantQuestions.length > 0 && results.importantQuestions[0].question === "Processing Error") {
        setError("I had some trouble analyzing those notes. I'll show you what I could find anyway!");
        onResults(results); // Show what we have (even if it's just a preview)
      } else if (results.importantQuestions.length > 0 && results.importantQuestions[0].question === "Summary of provided content") {
        setError("The notes were a bit messy, so I've created a general summary for you.");
        onResults(results);
      } else {
        try {
          // Add filename as title
          const resultsWithTitle = {
            ...results,
            title: file?.name.replace(/\.[^/.]+$/, "") // Remove extension
          };
          onResults(resultsWithTitle);
        } catch (err: any) {
          setError("Oops! Something went wrong on my end. Please try again.");
        }
      }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4">
      <div className={`relative border border-slate-200 dark:border-slate-800 transition-all duration-300 rounded-2xl p-12 glass-card ${
        file ? 'bg-slate-50/50 dark:bg-slate-900/50' : 'hover:border-slate-400 dark:hover:border-slate-600'
      }`}>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={`p-5 rounded-full ${
            file ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}>
            {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {file ? "Ready to process" : "Upload material"}
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">
              {file ? `${file.name}` : "Drop your notes or photos here. I can read PDFs, JPGs, or PNG notes up to 10MB."}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(loading || status) && !error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 space-y-3"
          >
            <div className="flex justify-between items-end mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {status}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-slate-900 dark:bg-slate-100 h-full rounded-full transition-all duration-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-6 p-4 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wide border border-red-100 dark:border-red-900/30"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full mt-10 py-5 px-8 bg-slate-900 dark:bg-slate-100 disabled:opacity-30 text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:opacity-90 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {file?.type.startsWith("image/") ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            ) : (
              <FileText size={18} />
            )}
            <span>Analyze Material</span>
          </>
        )}
      </button>
    </div>
  );
}
