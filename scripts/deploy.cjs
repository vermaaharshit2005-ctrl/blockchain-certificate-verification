const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  console.log("Deploying CertificateRegistry contract...");

  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const certRegistry = await CertificateRegistry.deploy();
  await certRegistry.waitForDeployment();

  const contractAddress = await certRegistry.getAddress();
  console.log(`CertificateRegistry deployed successfully to: ${contractAddress}`);

  // Seed sample demo certificates
  console.log("Seeding initial demo certificates...");

  const demoCerts = [
    {
      id: "CERT-2025-0891",
      recipientName: "Alex Rivera",
      courseName: "Advanced Blockchain Architecture & Smart Contract Security",
      hash: "0x8f4b23c9a1d4e5f7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f012",
      metadata: JSON.stringify({
        grade: "Distinction (98%)",
        issuerName: "Ethereum Academic Consortium",
        credentialId: "ETH-ARCH-9921",
        skills: ["Solidity", "EVM", "Smart Contract Auditing", "DeFi Protocols"],
        duration: "16 Weeks / 120 Hours"
      })
    },
    {
      id: "CERT-2025-1044",
      recipientName: "Dr. Maya Lin",
      courseName: "Quantum Computing & Cryptographic Primitives",
      hash: "0x3a7e91f0c2b5d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4",
      metadata: JSON.stringify({
        grade: "High Honors",
        issuerName: "Post-Quantum Cryptography Institute",
        credentialId: "PQCI-8841",
        skills: ["Lattice Cryptography", "Quantum Key Distribution", "Post-Quantum Signatures"],
        duration: "24 Weeks / 200 Hours"
      })
    },
    {
      id: "CERT-2025-2319",
      recipientName: "Jordan Hayes",
      courseName: "Full-Stack Web3 DApp Engineering with Ethers.js",
      hash: "0x12c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4",
      metadata: JSON.stringify({
        grade: "Excellence (95%)",
        issuerName: "Web3 Builders Guild",
        credentialId: "W3B-7712",
        skills: ["React", "Ethers.js", "IPFS", "Hardhat", "Tailwind CSS"],
        duration: "12 Weeks / 90 Hours"
      })
    }
  ];

  for (const cert of demoCerts) {
    const tx = await certRegistry.issueCertificate(
      cert.id,
      cert.recipientName,
      cert.courseName,
      cert.hash,
      cert.metadata
    );
    await tx.wait();
    console.log(`Issued demo certificate: ${cert.id} (${cert.recipientName})`);
  }

  // Get contract artifact for ABI
  const artifact = await hre.artifacts.readArtifact("CertificateRegistry");

  // Write contract address and ABI to src directory
  const targetDir = path.join(__dirname, "..", "src", "contracts");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const exportData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: 31337,
    abi: artifact.abi,
    sampleIds: demoCerts.map((c) => c.id),
  };

  const outputPath = path.join(targetDir, "contractData.json");
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
  console.log(`Exported contract data to: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
