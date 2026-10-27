# CertiChain — Blockchain Certificate Verification System

A modern, responsive, decentralized certificate issuance and verification application powered by **React**, **Tailwind CSS**, **Solidity**, **Ethers.js v6**, and a local **Hardhat** blockchain.

---

## 🌟 Key Features

1. **Modern Blockchain-Themed Dashboard**:
   - Dark cyberpunk / enterprise aesthetic with subtle glow accents (cyan, amber, emerald).
   - Real-time **Network Status Pill** showing Hardhat connection (`Chain #31337`), current block number, and contract address.
   - Dual-mode support: Works directly with the local Hardhat EVM node (zero MetaMask setup required via direct account signer), and features seamless fallback mode with demo data if the node is temporarily offline.

2. **Certificate Issuance Engine**:
   - Issue certificates with Student Name, Course Title, Certificate ID, Honors/Grade, Organization, and Skills.
   - Computes deterministic real-time **SHA-256 cryptographic hashes** before writing to the smart contract.
   - Auto-generates unique IDs or supports custom identifiers.
   - Triggers celebratory confetti upon block confirmation.

3. **Instant On-Chain Verification**:
   - Verify certificates by entering their ID or selecting sample chips (`CERT-2025-0891`, `CERT-2025-1044`, `CERT-2025-2319`).
   - Querying the Solidity smart contract returns:
     - **Verified Status**: Renders an authentic gold-framed certificate with official seal, issuer address, consensus confirmation, and unique QR code.
     - **Invalid / Tampered Status**: Clear alert with diagnostic guidance.
   - Supports QR Code scanning and JSON payload verification.
   - Supports deep-linking: `http://localhost:5173/?verify=CERT-2025-0891`.

4. **Dynamic QR Code Generation**:
   - Every certificate renders a cryptographic QR code containing certificate metadata and verification payload.
   - One-click **Download QR Badge as PNG** button for students to attach to resumes or LinkedIn.
   - **Print / Save as PDF** support.

5. **Certificate Registry Explorer & History**:
   - Searchable ledger history table/grid.
   - Filter by Student Name, Course, or ID.
   - Quick "Verify & Inspect", "View QR", and "Copy Hash" buttons.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Smart Contract** | Solidity `^0.8.28` | [`contracts/CertificateRegistry.sol`](./contracts/CertificateRegistry.sol) stores certificate records and hashes in an immutable mapping. |
| **Blockchain** | Hardhat Local Node | Runs on `http://127.0.0.1:8545` (Chain ID `31337`). |
| **Web3 Client** | Ethers.js `v6` | Handles RPC communication, signing, and contract function calls. |
| **Frontend** | React 19 + Vite | Blazing fast SPA with hot module reloading. |
| **Styling** | Tailwind CSS v4 | Responsive layout with luxury certificate frames and glowing effects. |
| **Icons & Effects** | Lucide React + Canvas Confetti | Modern UI icons and celebratory effects. |

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Quick Start Commands

The project is pre-configured and already running in your background environment. If you want to run it from scratch in separate terminals:

#### **Terminal 1: Start Local Hardhat Blockchain**
```bash
npm run node
```
*Starts local Ethereum JSON-RPC node at `http://127.0.0.1:8545` with 20 funded test accounts.*

#### **Terminal 2: Deploy Contract & Seed Sample Data**
```bash
npm run deploy
```
*Compiles `CertificateRegistry.sol`, deploys it to the local node, seeds 3 realistic demo certificates, and exports the contract address and ABI to `src/contracts/contractData.json`.*

#### **Terminal 3: Start React Development Server**
```bash
npm run dev
```
*Access the application in your browser at: **`http://localhost:5173`**.*

---

## 📋 Pre-Seeded Sample Certificates for Quick Testing

You can instantly test the verification engine using any of these IDs:

| Certificate ID | Student Name | Course Title | Status |
|---|---|---|---|
| `CERT-2025-0891` | Alex Rivera | Advanced Blockchain Architecture & Smart Contract Security | ✅ **Verified** |
| `CERT-2025-1044` | Dr. Maya Lin | Quantum Computing & Cryptographic Primitives | ✅ **Verified** |
| `CERT-2025-2319` | Jordan Hayes | Full-Stack Web3 DApp Engineering with Ethers.js | ✅ **Verified** |
| `CERT-INVALID-999`| N/A | Non-Existent Identifier | ❌ **Invalid** |

---

## 📜 Smart Contract Reference

Deployed address on local Hardhat chain:
`0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Key Contract Functions:
- `issueCertificate(string id, string recipientName, string courseName, string certificateHash, string metadataJson)`
- `verifyCertificate(string id)` → returns `(bool exists, string id, string recipientName, string courseName, string certificateHash, string metadataJson, uint256 issueDate, address issuer, bool isValid)`
- `getAllCertificates()` → returns array of all registered `Certificate` structs.
- `revokeCertificate(string id)` → marks a certificate as invalid.
