import { useState, useRef } from "react";
import { api } from "../api";
import {
  Upload, FileSpreadsheet, X, CheckCircle2, AlertTriangle,
} from "lucide-react";

export default function UploadModal({ onClose, onDone }) {
  const [phase, setPhase] = useState("pick");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    const valid = f.name.endsWith(".csv") || f.name.endsWith(".xlsx") || f.name.endsWith(".xls");
    if (!valid) {
      setError("Please upload a CSV file (.csv)");
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setPhase("uploading");
    setError(null);
    try {
      const data = await api.uploadCSV(file);
      setResult(data);
      setPhase("result");
    } catch (err) {
      setError(err.message);
      setPhase("pick");
    }
  };

  const handleClose = () => {
    if (phase === "result") onDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="bg-[#0d0d0d] border border-[#262626] rounded-lg shadow-2xl shadow-black/50 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <div>
            <h3 className="text-[15px] font-semibold text-white">Import contacts</h3>
            <p className="text-[12px] text-[#71717a] mt-0.5">Upload an Apollo CSV export</p>
          </div>
          <button onClick={handleClose} className="p-1.5 -mr-1 hover:bg-[#161616] rounded-md transition-colors">
            <X className="w-4 h-4 text-[#71717a]" />
          </button>
        </div>

        <div className="p-5">
          {phase === "pick" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative border border-dashed rounded-md p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-white bg-[#161616]"
                    : file
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-[#262626] hover:border-[#3f3f3f] hover:bg-[#0f0f0f]"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => handleFile(e.target.files[0])}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white">{file.name}</p>
                      <p className="text-[11px] font-mono text-[#71717a] mt-0.5 tabular-nums">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-[12px] text-[#71717a] hover:text-red-400 font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-10 h-10 rounded-md bg-[#161616] border border-[#262626] flex items-center justify-center">
                      <Upload className="w-4 h-4 text-[#a1a1aa]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white">
                        Drop CSV file or <span className="underline underline-offset-4 decoration-[#3f3f3f]">browse</span>
                      </p>
                      <p className="text-[11px] text-[#52525b] mt-1">
                        Apollo CSV exports supported
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-md text-[12px] text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file}
                className="w-full inline-flex items-center justify-center gap-2 h-9 bg-white text-black text-[13px] font-medium rounded-md hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload &amp; import
              </button>
            </div>
          )}

          {phase === "uploading" && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center mb-5">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-1.5">Importing contacts</h3>
              <p className="text-[13px] text-[#71717a] mb-6 max-w-[280px]">
                Processing <span className="font-mono text-[#a1a1aa]">{file?.name}</span>. Duplicates are skipped.
              </p>
              <div className="w-full max-w-[260px] h-0.5 bg-[#1a1a1a] rounded-full overflow-hidden animate-progress" />
            </div>
          )}

          {phase === "result" && result && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-1">Import complete</h3>
                <p className="text-[13px] text-[#71717a]">
                  Processed <span className="font-mono text-[#a1a1aa] tabular-nums">{result.total}</span> records
                </p>
              </div>

              <div className="grid grid-cols-3 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-md overflow-hidden">
                <StatCell label="Total" value={result.total} dotColor="bg-[#525252]" />
                <StatCell label="Added" value={result.inserted} dotColor="bg-emerald-500" />
                <StatCell label="Skipped" value={result.skipped} dotColor="bg-amber-500" />
              </div>

              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-md px-3 py-2.5 text-[12px] text-[#a1a1aa] leading-relaxed">
                {result.inserted > 0 ? (
                  <>
                    <span className="font-mono text-emerald-400 tabular-nums">{result.inserted}</span> new contacts added.
                    {result.skipped > 0 && (
                      <> <span className="font-mono text-amber-400 tabular-nums">{result.skipped}</span> duplicates skipped.</>
                    )}
                  </>
                ) : (
                  <>All <span className="font-mono tabular-nums">{result.total}</span> contacts already exist. No new contacts were added.</>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full inline-flex items-center justify-center h-9 bg-white text-black text-[13px] font-medium rounded-md hover:bg-[#e5e5e5] transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, dotColor }) {
  return (
    <div className="bg-[#0d0d0d] px-3 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className="text-[10px] font-mono font-semibold text-[#71717a] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-[20px] font-semibold text-white tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
