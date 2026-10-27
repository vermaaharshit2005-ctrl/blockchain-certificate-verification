import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { VerifyTab } from "./components/VerifyTab";
import { IssueTab } from "./components/IssueTab";
import { HistoryTab } from "./components/HistoryTab";
import { NodeModal } from "./components/NodeModal";
import { blockchainService } from "./services/blockchain";
import { ShieldCheck, Database, Cpu, ExternalLink } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState("verify");
  const [selectedCertId, setSelectedCertId] = useState("");
  const [nodeStatus, setNodeStatus] = useState({ online: false, blockNumber: null });
  const [showNodeModal, setShowNodeModal] = useState(false);

  const checkConnection = async () => {
    const status = await blockchainService.checkStatus();
    setNodeStatus(status);
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    // Check for ?verify= in URL query params
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get("verify");
    if (verifyParam) {
      setSelectedCertId(verifyParam);
      setActiveTab("verify");
    }

    return () => clearInterval(interval);
  }, []);

  const handleSelectCert = (id) => {
    setSelectedCertId(id);
    setActiveTab("verify");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCertificateIssued = (cert) => {
    // refresh node status if online
    checkConnection();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col cyber-grid">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nodeStatus={nodeStatus}
        onShowNodeGuide={() => setShowNodeModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner if node is offline */}
        {!nodeStatus.online && (
          <div className="mb-6 p-3 sm:p-4 rounded-xl bg-amber-950/30 border border-amber-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>
                <strong>Hardhat Node is not running locally.</strong> Currently operating in browser mock mode with full demo data and local storage support.
              </span>
            </div>
            <button
              onClick={() => setShowNodeModal(true)}
              className="text-amber-400 underline font-semibold hover:text-amber-300 text-left sm:text-right shrink-0"
            >
              Start Local Node (Instructions) →
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === "verify" && (
          <VerifyTab
            initialCertId={selectedCertId}
            onNavigateToIssue={() => setActiveTab("issue")}
          />
        )}

        {activeTab === "issue" && (
          <IssueTab
            onCertificateIssued={handleCertificateIssued}
            onSwitchToVerify={handleSelectCert}
          />
        )}

        {activeTab === "history" && (
          <HistoryTab
            onSelectCertificate={handleSelectCert}
            onResetDemo={() => {}}
          />
        )}
      </main>

      {/* Node Status / Startup Guide Modal */}
      <NodeModal
        isOpen={showNodeModal}
        onClose={() => setShowNodeModal(false)}
        nodeStatus={nodeStatus}
        onRefreshStatus={checkConnection}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">CertiChain Protocol</span>
            <span>• Solidity 0.8.28 EVM Registry</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-500">
            <span>React + Vite</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Ethers.js v6</span>
            <span>•</span>
            <span>Hardhat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
