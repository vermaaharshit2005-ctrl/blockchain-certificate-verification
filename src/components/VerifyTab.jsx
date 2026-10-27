import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Search, ShieldAlert, Sparkles, CheckCircle, RefreshCw, QrCode, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { CertificateCard } from "./CertificateCard";
import { blockchainService } from "../services/blockchain";

export function VerifyTab({ initialCertId, onNavigateToIssue }) {
  const [certId, setCertId] = useState(initialCertId || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInputText, setQrInputText] = useState("");

  const sampleIds = [
    { id: "CERT-2025-0891", name: "Alex Rivera", course: "Advanced Blockchain Architecture" },
    { id: "CERT-2025-1044", name: "Dr. Maya Lin", course: "Quantum Computing & Cryptography" },
    { id: "CERT-2025-2319", name: "Jordan Hayes", course: "Full-Stack Web3 DApp Engineering" },
  ];

  const handleVerify = async (idToVerify) => {
    const targetId = (idToVerify || certId).trim();
    if (!targetId) return;

    setLoading(true);
    setHasSearched(true);
    setResult(null);

    try {
      const data = await blockchainService.verifyCertificate(targetId);
      setResult(data);

      if (data.exists && data.isValid) {
        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#06b6d4", "#10b981", "#f59e0b", "#a855f7"],
          });
        } catch (e) {
          // ignore if canvas not supported
        }
      }
    } catch (err) {
      setResult({ exists: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCertId) {
      setCertId(initialCertId);
      handleVerify(initialCertId);
    }
  }, [initialCertId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handleSelectSample = (id) => {
    setCertId(id);
    handleVerify(id);
  };

  const handleTestInvalid = () => {
    setCertId("CERT-INVALID-9999");
    handleVerify("CERT-INVALID-9999");
  };

  const handleParseQrPayload = () => {
    try {
      const parsed = JSON.parse(qrInputText);
      if (parsed.id) {
        setCertId(parsed.id);
        handleVerify(parsed.id);
        setQrModalOpen(false);
        setQrInputText("");
        return;
      }
    } catch (e) {
      // If plain ID string was pasted
      if (qrInputText.trim()) {
        setCertId(qrInputText.trim());
        handleVerify(qrInputText.trim());
        setQrModalOpen(false);
        setQrInputText("");
        return;
      }
    }
    alert("Please enter a valid Certificate ID or JSON QR payload.");
  };

  return (
    <div className="space-y-10 py-6">
      {/* Hero Verification Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant Cryptographic Validation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verify Blockchain Credentials
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Verify the authenticity, issuance timestamp, and tamper-proof SHA-256 integrity hash of any student certificate directly against the local Ethereum smart contract.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
          <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-2 shadow-2xl">
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5 text-cyan-400" />
            </div>
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Certificate ID (e.g. CERT-2025-0891)..."
              className="w-full bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm sm:text-base font-mono py-2"
            />
            {certId && (
              <button
                onClick={() => setCertId("")}
                className="text-xs text-slate-500 hover:text-slate-300 mr-2"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => handleVerify()}
              disabled={loading || !certId.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Chips & QR Paste */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
            <span className="font-medium text-slate-500">Quick Test:</span>
            {sampleIds.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700/60 font-mono transition"
                title={`${sample.name} - ${sample.course}`}
              >
                {sample.id}
              </button>
            ))}
            <button
              onClick={handleTestInvalid}
              className="px-2.5 py-1 rounded-md bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 font-mono transition"
              title="Test non-existent certificate ID"
            >
              Invalid ID
            </button>
          </div>

          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-cyan-300 transition"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scan / Paste QR</span>
          </button>
        </div>
      </div>

      {/* Verification Results Display */}
      {loading && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-mono text-cyan-400">
            Querying local Solidity smart contract registry at 0x5FbD...0aa3
          </p>
          <p className="text-xs text-slate-500">Validating SHA-256 hash against ledger state...</p>
        </div>
      )}

      {!loading && hasSearched && result && (
        <div className="pt-4 transition-all duration-300">
          {result.exists && result.isValid ? (
            <div className="space-y-6">
              <div className="max-w-4xl mx-auto flex items-center justify-between p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Cryptographically Verified Valid</h4>
                    <p className="text-slate-400 text-xs">
                      Certificate record matches immutable smart contract storage. No tampering detected.
                    </p>
                  </div>
                </div>
                {result.isOfflineSimulated && (
                  <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-amber-950 border border-amber-800/80 text-amber-300">
                    Offline Cache Mode
                  </span>
                )}
              </div>

              {/* Render Full Certificate */}
              <CertificateCard certificate={result} />
            </div>
          ) : (
            /* Invalid or Revoked Certificate Display */
            <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-red-950/20 border border-red-500/30 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Certificate Status: INVALID</h3>
                <p className="text-sm text-red-300/80 font-mono">
                  ID: <span className="font-bold text-red-200">"{certId}"</span>
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  The requested certificate could not be validated on the blockchain registry. It either does not exist, has been revoked by the issuing authority, or has an invalid identification string.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handleSelectSample("CERT-2025-0891")}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  Try Valid Demo Certificate
                </button>
                <button
                  onClick={onNavigateToIssue}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition flex items-center space-x-1.5"
                >
                  <span>Issue This Certificate Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Code Paste Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Scan or Paste QR Code Data</h3>
              </div>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If you scanned a certificate's QR code using your phone or a barcode scanner, paste the scanned text or JSON payload here:
            </p>

            <textarea
              value={qrInputText}
              onChange={(e) => setQrInputText(e.target.value)}
              placeholder='e.g. {"id":"CERT-2025-0891","name":"Alex Rivera",...} or simply CERT-2025-0891'
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setQrModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleParseQrPayload}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
              >
                Verify Extracted ID
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
