import React from "react";
import { Server, CheckCircle2, AlertTriangle, Terminal, ExternalLink, RefreshCw, Layers } from "lucide-react";

export function NodeModal({ isOpen, onClose, nodeStatus, onRefreshStatus }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${nodeStatus?.online ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Local Blockchain Node Info</h2>
              <p className="text-xs text-slate-400">Hardhat EVM Localhost Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Live Network Details */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Node Status</span>
            <div className="flex items-center space-x-1.5 font-bold">
              {nodeStatus?.online ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">ONLINE (Chain #31337)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">OFFLINE (Demo Mode)</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">EVM Block Height</span>
            <p className="text-white font-bold">{nodeStatus?.blockNumber !== null ? `#${nodeStatus?.blockNumber}` : "N/A"}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 col-span-2">
            <span className="text-slate-500 text-[10px] uppercase">Deployed Contract Address</span>
            <p className="text-cyan-400 break-all select-all font-bold">
              {nodeStatus?.contractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
            </p>
          </div>
        </div>

        {/* Quick Instructions to start node */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>How to Start the Local Blockchain Node:</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800">
              <span className="text-slate-500"># Terminal 1 - Start Local Blockchain</span>
              <p className="text-cyan-300 select-all font-bold mt-0.5">npm run node</p>
            </div>

            <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800">
              <span className="text-slate-500"># Terminal 2 - Deploy & Seed Demo Certificates</span>
              <p className="text-emerald-300 select-all font-bold mt-0.5">npm run deploy</p>
            </div>
          </div>
        </div>

        {/* Zero-friction note */}
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-300 text-xs leading-relaxed">
          <strong>Tip:</strong> The app includes built-in Direct Account #0 signing. When the Hardhat node is running, issuing a certificate writes directly to the local chain without requiring MetaMask configuration!
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onRefreshStatus}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-check Connection</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
