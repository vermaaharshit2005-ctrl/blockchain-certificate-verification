import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { History, Search, CheckCircle2, XCircle, ArrowUpRight, QrCode, RefreshCw, Copy, Check, ShieldCheck, Download } from "lucide-react";
import { blockchainService } from "../services/blockchain";

export function HistoryTab({ onSelectCertificate, onResetDemo }) {
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedQrCert, setSelectedQrCert] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await blockchainService.getAllCertificates();
      setCertificates(data || []);
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filteredCerts = certificates.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.id.toLowerCase().includes(term) ||
      c.recipientName.toLowerCase().includes(term) ||
      c.courseName.toLowerCase().includes(term)
    );
  });

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQR = (cert) => {
    const svgElement = document.getElementById(`modal-qr-${cert.id}`);
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
      downloadLink.download = `QR-${cert.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <History className="w-7 h-7 text-cyan-400" />
            <span>Certificate Registry Explorer</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Browse and inspect all educational credentials anchored onto the smart contract ledger.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCertificates}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Ledger</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("Reset certificate history to default demo credentials?")) {
                blockchainService.resetLocalCerts();
                fetchCertificates();
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800/60 hover:bg-slate-700 text-amber-300 border border-amber-900/50 transition"
          >
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Filter and Count Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student, course, or ID..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="text-xs font-mono text-slate-400">
          Total Anchored: <span className="font-bold text-cyan-400">{certificates.length}</span> certificates
        </div>
      </div>

      {/* Certificate Table / Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-slate-400">Loading blockchain registry data...</p>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-slate-300 font-medium text-sm">No certificates found matching your search</p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-xs text-cyan-400 hover:underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCerts.map((cert) => {
            let meta = {};
            try {
              meta = cert.metadataJson ? JSON.parse(cert.metadataJson) : {};
            } catch (e) {}

            const formattedDate = cert.issueDate
              ? new Date(cert.issueDate * 1000).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A";

            return (
              <div
                key={cert.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/5 group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-xs font-bold text-amber-400">{cert.id}</span>
                      <button
                        onClick={() => handleCopy(cert.id)}
                        className="text-slate-500 hover:text-slate-300"
                        title="Copy ID"
                      >
                        {copiedId === cert.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {cert.isValid ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/80 text-red-300 border border-red-800/60">
                        <XCircle className="w-2.5 h-2.5 text-red-400" />
                        <span>Revoked</span>
                      </span>
                    )}
                  </div>

                  {/* Recipient and Course */}
                  <div className="py-4 space-y-1.5">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {cert.recipientName}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {cert.courseName}
                    </p>
                  </div>

                  {/* Badges */}
                  {meta.grade && (
                    <div className="mb-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-900/60">
                        {meta.grade}
                      </span>
                    </div>
                  )}

                  {/* Date and Issuer */}
                  <div className="text-[11px] font-mono text-slate-500 space-y-1">
                    <div>Issued: <span className="text-slate-400">{formattedDate}</span></div>
                    <div className="truncate">Hash: <span className="text-cyan-400/80">{cert.certificateHash}</span></div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedQrCert(cert)}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs flex items-center space-x-1"
                    title="View QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>QR</span>
                  </button>

                  <button
                    onClick={() => onSelectCertificate(cert.id)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify & Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {selectedQrCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold">{selectedQrCert.id}</span>
              <button
                onClick={() => setSelectedQrCert(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">{selectedQrCert.recipientName}</h3>
              <p className="text-xs text-slate-400">{selectedQrCert.courseName}</p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-lg ring-2 ring-cyan-500/40">
              <QRCodeSVG
                id={`modal-qr-${selectedQrCert.id}`}
                value={JSON.stringify({
                  id: selectedQrCert.id,
                  name: selectedQrCert.recipientName,
                  course: selectedQrCert.courseName,
                  hash: selectedQrCert.certificateHash,
                  valid: selectedQrCert.isValid,
                })}
                size={180}
                level="H"
              />
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Scan with any mobile device to view and verify credential metadata.
            </p>

            <div className="flex space-x-2">
              <button
                onClick={() => handleDownloadQR(selectedQrCert)}
                className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </button>
              <button
                onClick={() => {
                  const id = selectedQrCert.id;
                  setSelectedQrCert(null);
                  onSelectCertificate(id);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Verify Full
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
