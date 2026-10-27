import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Award, Sparkles, Hash, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, QrCode, Shield, Layers } from "lucide-react";
import { blockchainService, computeCertificateHash } from "../services/blockchain";
import { CertificateCard } from "./CertificateCard";

export function IssueTab({ onCertificateIssued, onSwitchToVerify }) {
  const [recipientName, setRecipientName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [certId, setCertId] = useState("");
  const [grade, setGrade] = useState("Distinction (98%)");
  const [institution, setInstitution] = useState("Ethereum Academic Consortium");
  const [duration, setDuration] = useState("16 Weeks / 120 Hours");
  const [skillsStr, setSkillsStr] = useState("Solidity, Smart Contracts, Cryptography, Web3");

  const [previewHash, setPreviewHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [issuedCert, setIssuedCert] = useState(null);
  const [txDetails, setTxDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Auto generate a standard ID
  const generateRandomId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setCertId(`CERT-${year}-${randomNum}`);
  };

  useEffect(() => {
    generateRandomId();
  }, []);

  // Update real-time cryptographic hash preview
  useEffect(() => {
    async function updateHash() {
      if (certId && recipientName && courseName) {
        const hash = await computeCertificateHash(certId, recipientName, courseName, Date.now());
        setPreviewHash(hash);
      } else {
        setPreviewHash("0x" + "0".repeat(64));
      }
    }
    updateHash();
  }, [certId, recipientName, courseName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!recipientName.trim() || !courseName.trim() || !certId.trim()) {
      setErrorMessage("Please fill in Student Name, Course, and Certificate ID.");
      return;
    }

    setLoading(true);

    try {
      const skillsArray = skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const metadata = {
        grade: grade.trim(),
        issuerName: institution.trim(),
        duration: duration.trim(),
        skills: skillsArray,
        credentialId: `CRED-${certId.trim()}`,
      };

      const finalHash = await computeCertificateHash(certId, recipientName, courseName, Date.now());

      const result = await blockchainService.issueCertificate({
        id: certId.trim(),
        recipientName: recipientName.trim(),
        courseName: courseName.trim(),
        hash: finalHash,
        metadata: metadata,
      });

      setIssuedCert(result.cert);
      setTxDetails(result);

      if (onCertificateIssued) {
        onCertificateIssued(result.cert);
      }

      // Celebrate
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#06b6d4", "#10b981", "#f59e0b", "#6366f1"],
        });
      } catch (err) {}
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.message.includes("already exists")
          ? `Certificate ID "${certId}" already exists on the ledger. Please generate a new unique ID.`
          : `Issuance error: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setIssuedCert(null);
    setTxDetails(null);
    setRecipientName("");
    setCourseName("");
    setSkillsStr("Solidity, Smart Contracts, Cryptography, Web3");
    generateRandomId();
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Smart Contract Minting Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Issue Blockchain Certificate
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Mint an immutable educational credential directly into the local Hardhat blockchain. The certificate hash and metadata will be permanently verifiable.
        </p>
      </div>

      {issuedCert ? (
        /* Post-Issuance Success View */
        <div className="space-y-8 animate-fade-in">
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Certificate Successfully Issued!</h2>
              <p className="text-sm text-emerald-300 font-mono">
                Stored permanently on Hardhat Ledger (ID: {issuedCert.id})
              </p>
            </div>

            {txDetails && (
              <div className="max-w-md mx-auto p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Hash:</span>
                  <span className="text-cyan-400 truncate max-w-[200px]">{txDetails.txHash}</span>
                </div>
                {txDetails.blockNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Confirmed Block:</span>
                    <span className="text-white">#{txDetails.blockNumber}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onSwitchToVerify(issuedCert.id)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition"
              >
                <span>Verify in Explorer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetForm}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
              >
                Issue Another Certificate
              </button>
            </div>
          </div>

          {/* Render newly minted certificate card */}
          <div className="pt-2">
            <CertificateCard certificate={issuedCert} />
          </div>
        </div>
      ) : (
        /* Issuance Form */
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Student / Recipient Full Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Samantha Vance"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                />
              </div>

              {/* Course Title */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Course or Program Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Zero-Knowledge Cryptography & Rollups"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                />
              </div>

              {/* Certificate ID */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Unique Certificate ID <span className="text-cyan-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomId}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="e.g. CERT-2026-4402"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                />
              </div>

              {/* Issuing Institution */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Ethereum Academic Consortium"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                />
              </div>

              {/* Grade / Honors */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Grade / Evaluation
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. Distinction (98%)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                />
              </div>

              {/* Duration / Hours */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Program Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 16 Weeks / 120 Hours"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
                />
              </div>
            </div>

            {/* Skills / Specializations */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Certified Skills (Comma Separated)
              </label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="Solidity, Web3, Cryptography, React"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition text-sm"
              />
            </div>

            {/* Live Cryptographic Preview Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-300">Deterministic SHA-256 Digest:</span>
              </div>
              <p className="font-mono text-xs text-cyan-300/90 break-all select-all bg-black/40 p-2.5 rounded-lg border border-cyan-950">
                {previewHash}
              </p>
              <p className="text-[11px] text-slate-500">
                This mathematical hash will be permanently written to the smart contract mapping. Any modification to the certificate data will invalidate verification.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-base shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Broadcasting & Writing to Hardhat Node...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    <span>Issue & Anchor on Blockchain</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
