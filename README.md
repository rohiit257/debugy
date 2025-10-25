# 🛡️ BugBountyX — Decentralized Bug Bounty & Audit Marketplace (Monad Powered)

BugBountyX is a **decentralized platform** that connects **organizations** looking to secure their products with **ethical hackers** and **auditors** who find vulnerabilities.  
Built using **Next.js**, **Express.js**, **Prisma**, and **Monad blockchain**, it ensures **transparency, security, and trust** through **on-chain escrows** and **verifiable rewards**.

---

## 🚀 Features

### 🧩 Core Functionality
- **Sign-In with Ethereum (SIWE)** — Web3 login using wallet signatures.
- **Role-Based Access** — `Hunter`, `Organization`, and `Admin` roles.
- **Bounty Lifecycle**
  - Organization creates bounty.
  - Hunters submit findings.
  - Org reviews, accepts, and releases payment via Monad smart contract.
- **Escrow Smart Contract** — Secures funds until verification is complete.
- **Onboarding Flow** — After SIWE, users complete their profiles with name, email, bio, and role.
- **Secure JWT Authentication** — Express backend issues tokens after SIWE verification.

---

## 🔗 Blockchain Integration (Monad)

**Why Monad?**
- ⚡ **High Throughput & Parallel EVM Execution** — Thousands of tx/s with low latency.
- 💸 **Low Gas Fees** — Affordable for frequent transactions.
- 🧠 **EVM Compatibility** — Deploy Solidity contracts directly.
- 🔒 **Instant Finality** — 1s confirmation for reward payouts.
- 🚀 **Early Ecosystem Advantage** — Visibility, grants, and community support.

**On-chain Use Cases**
- Bounty escrow and reward release.
- Proof-of-finding NFTs for verified hunters.
- On-chain timestamping for report submissions.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js, Tailwind CSS, NextAuth.js |
| **Backend** | Express.js, TypeScript, Prisma ORM |
| **Database** | PostgreSQL (via Prisma) |
| **Blockchain** | Monad (EVM Compatible) |
| **Auth** | Sign-In with Ethereum (SIWE) + JWT |
| **File Storage** | IPFS / Pinata for report attachments |
| **Monitoring** | Prometheus + Grafana |
| **Deployment** | Docker + AWS ECS / EC2 |
| **Caching** | Redis (for bounty data & sessions) |

---
Frontend (Next.js)
     │
     ▼
NextAuth (SIWE + JWT)
     │
     ▼
Auth Service (Express + Prisma)
     │
     ├── Verifies SIWE signature
     ├── Creates user (if new)
     └── Issues JWT
     │
     ▼
Bounty Service (Express + Prisma)
     │
     ├── Create / Fetch / Update Bounties
     └── Interact with Monad Smart Contracts
     │
     ▼
IPFS — store bounty reports & evidence
Redis — cache bounties and leaderboard
Prometheus — logs metrics
Grafana — visualizes performance
