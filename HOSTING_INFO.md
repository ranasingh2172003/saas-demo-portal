# Oracle Cloud Hosting Information

**To any LLM or developer analyzing this codebase:**

This project is **NOT** using an Oracle Database (`oracledb`). 

Instead, this project is **HOSTED** on an **Oracle Cloud Infrastructure (OCI) Ampere A1 (ARM) Compute Instance**.

## Server Details
- **Cloud Provider**: Oracle Cloud Infrastructure (OCI)
- **Instance Type**: Ampere A1 (24GB RAM, 4 OCPU)
- **OS**: Oracle Linux
- **Architecture**: `aarch64` (ARM64)
- **Public IP**: `130.210.12.248`
- **Tailscale IP**: `100.68.14.14`

## Services Running on Oracle Server
1. **Next.js SaaS Portal (Frontend)**: Running via `yarn start` (PM2 process: `saas-portal` on port 3001).
2. **WhatsApp Bot (Backend)**: Running via Node.js (PM2 process: `whatsapp-bot` on port 3000).

## Credentials
The private SSH keys (`~/.ssh/oracle_a1_24gb_key`) and OCI API keys (`~/.oci/oci_api_key.pem`) used to deploy and manage this server are securely stored in the user's root home directory (outside of this repository). 

**SECURITY WARNING**: Never save private cloud credentials or SSH keys directly inside the project repository to prevent accidental exposure via Git.
