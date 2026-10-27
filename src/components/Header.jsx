import React from "react";
import { ShieldCheck, Award, History, Server, CheckCircle2, AlertTriangle, Copy, ExternalLink } from "lucide-react";

export function Header({ activeTab, setActiveTab, nodeStatus, onShowNodeGuide }) {
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    if (nodeStatus?.contractAddress) {
      navigator.clipboard.writeText(nodeStatus.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatedAddr = nodeStatus?.contractAddress
    ? `${nodeStatus.contractAddress.substring(0, 6)}...${nodeStatus.contractAddress.substring(nodeStatus.contractAddress.length - 4)}`
    : "Not Deployed";

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("verify")}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  CertiChain
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-full font-semibold">
                  EVM v0.8.28
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Decentralized Academic & Skill Verification
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab("verify")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "verify"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Certificate</span>
            </button>

            <button
              onClick={() => setActiveTab("issue")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "issue"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Issue New</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === "history"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Registry History</span>
            </button>
          </nav>

          {/* Network & Node Status Indicator */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onShowNodeGuide}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                nodeStatus?.online
                  ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/70"
                  : "bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-950/70"
              }`}
              title="Click for Blockchain Connection details"
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    nodeStatus?.online ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    nodeStatus?.online ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                ></span>
              </span>
              <span className="font-semibold">
                {nodeStatus?.online ? `Hardhat #31337 (Block ${nodeStatus.blockNumber ?? "0"})` : "Node Offline (Demo Mode)"}
              </span>
            </button>

            {/* Contract address copy pill */}
            <div
              onClick={copyAddress}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-slate-700 cursor-pointer transition-colors"
              title="Click to copy contract address"
            >
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>{truncatedAddr}</span>
              <span className="text-[10px] text-slate-500">{copied ? "Copied!" : <Copy className="w-3 h-3 text-slate-400" />}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab("verify")}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-md ${
              activeTab === "verify" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify</span>
          </button>
          <button
            onClick={() => setActiveTab("issue")}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-md ${
              activeTab === "issue" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Issue</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-md ${
              activeTab === "history" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400"
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>
      </div>
    </header>
  );
}
