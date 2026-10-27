import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, XCircle, Award, Calendar, Hash, User, BookOpen, Shield, Download, Printer, Copy, Check } from "lucide-react";

export function CertificateCard({ certificate, onDownloadQR, onPrint }) {
  const [copiedHash, setCopiedHash] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);

  if (!certificate) return null;

  let meta = {};
  try {
    meta = certificate.metadataJson ? JSON.parse(certificate.metadataJson) : {};
  } catch (e) {
    meta = {};
  }

  const issueDateFormatted = certificate.issueDate
    ? new Date(certificate.issueDate * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const qrPayload = JSON.stringify({
    id: certificate.id,
    name: certificate.recipientName,
    course: certificate.courseName,
    hash: certificate.certificateHash,
    valid: certificate.isValid,
  });

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "hash") {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    const svgElement = document.getElementById(`qr-svg-${certificate.id}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 20, 20, 360, 360);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${certificate.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Outer Certificate Frame */}
      <div
        id="printable-certificate"
        className="certificate-frame rounded-2xl p-6 sm:p-10 text-slate-100 shadow-2xl overflow-hidden border border-amber-500/30"
      >
        {/* Subtle background cryptographic watermarks */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Certificate Top Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-amber-500/20 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-mono tracking-widest uppercase text-amber-400 font-semibold">
                {meta.issuerName || "Ethereum Academic Consortium"}
              </p>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Certificate of Completion & Mastery
              </h2>
            </div>
          </div>

          {/* Verification Status Pill */}
          <div className="flex items-center space-x-2">
            {certificate.isValid ? (
              <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold shadow-sm shadow-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Verified On-Chain</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold">
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Certificate Revoked</span>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Body */}
        <div className="relative z-10 py-10 text-center space-y-6">
          <p className="text-sm font-medium uppercase tracking-widest text-slate-400">
            This is cryptographically verified to certify that
          </p>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-serif-title bg-gradient-to-r from-amber-100 via-white to-amber-200 bg-clip-text text-transparent">
            {certificate.recipientName}
          </h1>

          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            has successfully fulfilled all curriculum requirements, evaluations, and practical demonstrations for
          </p>

          <div className="py-2">
            <span className="inline-block text-xl sm:text-2xl font-bold text-cyan-300 px-6 py-2 rounded-xl bg-cyan-950/40 border border-cyan-800/60 shadow-inner">
              {certificate.courseName}
            </span>
          </div>

          {/* Metadata Badges (Grade, Duration, Skills) */}
          {meta.grade || meta.skills ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {meta.grade && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-700/50">
                  Grade: {meta.grade}
                </span>
              )}
              {meta.duration && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/60 text-slate-300 border border-slate-700/50">
                  {meta.duration}
                </span>
              )}
              {meta.skills &&
                meta.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900 text-cyan-300 border border-cyan-900/60"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          ) : null}
        </div>

        {/* Certificate Footer / Blockchain Provenance Grid */}
        <div className="relative z-10 pt-6 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Certificate ID & Issue Date */}
          <div className="space-y-3 text-left">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
                Certificate ID
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="font-mono text-sm font-bold text-amber-400">{certificate.id}</span>
                <button
                  onClick={() => copyToClipboard(certificate.id, "id")}
                  className="text-slate-400 hover:text-white"
                  title="Copy Certificate ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
                Date of Issuance
              </span>
              <span className="text-xs font-medium text-slate-300 flex items-center space-x-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{issueDateFormatted}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block">
                Issuer Ethereum Address
              </span>
              <span className="text-[11px] font-mono text-slate-400 break-all block mt-0.5">
                {certificate.issuer}
              </span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash Seal */}
          <div className="text-center p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-center space-x-1 text-cyan-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
                Cryptographic Seal
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-1.5">SHA-256 Immutability Hash</p>
            <div className="p-2 rounded bg-black/50 border border-cyan-950 flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-300 truncate max-w-[190px]">
                {certificate.certificateHash}
              </span>
              <button
                onClick={() => copyToClipboard(certificate.certificateHash, "hash")}
                className="text-cyan-400 hover:text-cyan-200 ml-2"
                title="Copy Hash"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono mt-2 inline-flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              Consensus Block Verified
            </span>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="p-2.5 bg-white rounded-xl shadow-lg ring-2 ring-amber-400/30">
              <QRCodeSVG
                id={`qr-svg-${certificate.id}`}
                value={qrPayload}
                size={96}
                level="M"
                includeMargin={false}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400">Scan to Verify Authenticity</span>
            <button
              onClick={handleDownloadQR}
              className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <Download className="w-3 h-3" />
              <span>Download QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons row below certificate */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="text-xs text-slate-500 font-mono flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Public Ledger Record Verified</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={handleDownloadQR}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR Badge</span>
          </button>
        </div>
      </div>
    </div>
  );
}
