import { ethers } from "ethers";
import contractInfo from "../contracts/contractData.json";

const HARDHAT_RPC = "http://127.0.0.1:8545";
// Hardhat default Account #0 private key for zero-friction local issuing
const HARDHAT_DEFAULT_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Fallback demo state if blockchain node is temporarily offline
export const FALLBACK_DEMO_CERTS = [
  {
    id: "CERT-2025-0891",
    recipientName: "Alex Rivera",
    courseName: "Advanced Blockchain Architecture & Smart Contract Security",
    certificateHash: "0x8f4b23c9a1d4e5f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f012",
    metadataJson: JSON.stringify({
      grade: "Distinction (98%)",
      issuerName: "Ethereum Academic Consortium",
      credentialId: "ETH-ARCH-9921",
      skills: ["Solidity", "EVM", "Smart Contract Auditing", "DeFi Protocols"],
      duration: "16 Weeks / 120 Hours"
    }),
    issueDate: 1735689600, // Jan 1, 2025
    issuer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    isValid: true
  },
  {
    id: "CERT-2025-1044",
    recipientName: "Dr. Maya Lin",
    courseName: "Quantum Computing & Cryptographic Primitives",
    certificateHash: "0x3a7e91f0c2b5d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4",
    metadataJson: JSON.stringify({
      grade: "High Honors",
      issuerName: "Post-Quantum Cryptography Institute",
      credentialId: "PQCI-8841",
      skills: ["Lattice Cryptography", "Quantum Key Distribution", "Post-Quantum Signatures"],
      duration: "24 Weeks / 200 Hours"
    }),
    issueDate: 1738368000, // Feb 1, 2025
    issuer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    isValid: true
  },
  {
    id: "CERT-2025-2319",
    recipientName: "Jordan Hayes",
    courseName: "Full-Stack Web3 DApp Engineering with Ethers.js",
    certificateHash: "0x12c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
    metadataJson: JSON.stringify({
      grade: "Excellence (95%)",
      issuerName: "Web3 Builders Guild",
      credentialId: "W3B-7712",
      skills: ["React", "Ethers.js", "IPFS", "Hardhat", "Tailwind CSS"],
      duration: "12 Weeks / 90 Hours"
    }),
    issueDate: 1740787200, // Mar 1, 2025
    issuer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    isValid: true
  }
];

// Helper to compute cryptographic hash for a certificate
export async function computeCertificateHash(id, recipient, course, date) {
  const payload = `${id.trim()}-${recipient.trim()}-${course.trim()}-${date}`;
  const utf8 = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export class BlockchainService {
  constructor() {
    this.contractAddress = contractInfo.address;
    this.abi = contractInfo.abi;
    this.isOnline = false;
    this.latestBlock = null;
    this.provider = null;
    this.useMetaMask = false;
  }

  async getProvider() {
    try {
      if (this.useMetaMask && typeof window !== "undefined" && window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
      }
      return new ethers.JsonRpcProvider(HARDHAT_RPC);
    } catch {
      return null;
    }
  }

  async checkStatus() {
    try {
      const provider = new ethers.JsonRpcProvider(HARDHAT_RPC);
      // Timeout after 2 seconds to not freeze UI
      const blockPromise = provider.getBlockNumber();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("RPC Timeout")), 2000)
      );
      const blockNum = await Promise.race([blockPromise, timeoutPromise]);
      this.isOnline = true;
      this.latestBlock = blockNum;
      this.provider = provider;
      return { online: true, blockNumber: blockNum, contractAddress: this.contractAddress };
    } catch (err) {
      this.isOnline = false;
      return { online: false, blockNumber: null, contractAddress: this.contractAddress, error: err.message };
    }
  }

  async getSigner() {
    if (this.useMetaMask && typeof window !== "undefined" && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      return await browserProvider.getSigner();
    }
    const rpcProvider = new ethers.JsonRpcProvider(HARDHAT_RPC);
    return new ethers.Wallet(HARDHAT_DEFAULT_KEY, rpcProvider);
  }

  async getContract(withSigner = false) {
    if (withSigner) {
      const signer = await this.getSigner();
      return new ethers.Contract(this.contractAddress, this.abi, signer);
    }
    const provider = await this.getProvider();
    return new ethers.Contract(this.contractAddress, this.abi, provider);
  }

  async verifyCertificate(certId) {
    const cleanId = certId.trim();
    if (!cleanId) return { exists: false, error: "Empty Certificate ID" };

    const status = await this.checkStatus();
    if (!status.online) {
      // Offline fallback lookup from demo data and localStorage
      const localCerts = this.getLocalCerts();
      const found = localCerts.find(c => c.id.toLowerCase() === cleanId.toLowerCase());
      if (found) {
        return {
          exists: true,
          id: found.id,
          recipientName: found.recipientName,
          courseName: found.courseName,
          certificateHash: found.certificateHash,
          metadataJson: found.metadataJson,
          issueDate: Number(found.issueDate),
          issuer: found.issuer,
          isValid: found.isValid,
          isOfflineSimulated: true
        };
      }
      return { exists: false, isOfflineSimulated: true };
    }

    try {
      const contract = await this.getContract(false);
      const result = await contract.verifyCertificate(cleanId);
      
      const exists = result[0];
      if (!exists) {
        return { exists: false };
      }

      return {
        exists: true,
        id: result[1],
        recipientName: result[2],
        courseName: result[3],
        certificateHash: result[4],
        metadataJson: result[5],
        issueDate: Number(result[6]),
        issuer: result[7],
        isValid: result[8],
        isOfflineSimulated: false
      };
    } catch (err) {
      console.warn("Smart contract call error, falling back to local registry:", err);
      const localCerts = this.getLocalCerts();
      const found = localCerts.find(c => c.id.toLowerCase() === cleanId.toLowerCase());
      if (found) {
        return { ...found, exists: true, isOfflineSimulated: true };
      }
      return { exists: false, error: err.message };
    }
  }

  async issueCertificate({ id, recipientName, courseName, hash, metadata }) {
    const status = await this.checkStatus();
    
    if (!status.online) {
      // Save locally if node offline
      const newCert = {
        id: id.trim(),
        recipientName: recipientName.trim(),
        courseName: courseName.trim(),
        certificateHash: hash,
        metadataJson: JSON.stringify(metadata),
        issueDate: Math.floor(Date.now() / 1000),
        issuer: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        isValid: true
      };
      this.saveLocalCert(newCert);
      return {
        success: true,
        txHash: "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join(""),
        cert: newCert,
        isOfflineSimulated: true
      };
    }

    try {
      const contract = await this.getContract(true);
      const metadataStr = typeof metadata === "string" ? metadata : JSON.stringify(metadata);
      
      const tx = await contract.issueCertificate(
        id.trim(),
        recipientName.trim(),
        courseName.trim(),
        hash,
        metadataStr
      );
      const receipt = await tx.wait();
      
      const newCert = {
        id: id.trim(),
        recipientName: recipientName.trim(),
        courseName: courseName.trim(),
        certificateHash: hash,
        metadataJson: metadataStr,
        issueDate: Math.floor(Date.now() / 1000),
        issuer: await (await this.getSigner()).getAddress(),
        isValid: true
      };
      
      // Also cache locally
      this.saveLocalCert(newCert);

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        cert: newCert,
        isOfflineSimulated: false
      };
    } catch (err) {
      console.error("Contract issueCertificate error:", err);
      throw err;
    }
  }

  async getAllCertificates() {
    const status = await this.checkStatus();
    if (!status.online) {
      return this.getLocalCerts();
    }

    try {
      const contract = await this.getContract(false);
      const rawCerts = await contract.getAllCertificates();
      
      if (!rawCerts || rawCerts.length === 0) {
        return this.getLocalCerts();
      }

      return rawCerts.map(c => ({
        id: c.id,
        recipientName: c.recipientName,
        courseName: c.courseName,
        certificateHash: c.certificateHash,
        metadataJson: c.metadataJson,
        issueDate: Number(c.issueDate),
        issuer: c.issuer,
        isValid: c.isValid
      }));
    } catch (err) {
      console.warn("Failed fetching from chain, using local store:", err);
      return this.getLocalCerts();
    }
  }

  // Local storage cache management
  getLocalCerts() {
    try {
      const stored = localStorage.getItem("certichain_certificates");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("localStorage read failed:", e);
    }
    // Return default seeded certificates
    return FALLBACK_DEMO_CERTS;
  }

  saveLocalCert(newCert) {
    try {
      const current = this.getLocalCerts();
      const updated = [newCert, ...current.filter(c => c.id !== newCert.id)];
      localStorage.setItem("certichain_certificates", JSON.stringify(updated));
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }
  }

  resetLocalCerts() {
    try {
      localStorage.setItem("certichain_certificates", JSON.stringify(FALLBACK_DEMO_CERTS));
    } catch (e) {
      console.warn("localStorage reset failed:", e);
    }
  }
}

export const blockchainService = new BlockchainService();
