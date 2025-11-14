require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Demo in-memory DB (replace with Postgres/Mongo in prod)
const users = {}; // { email: { passwordHash, wallet, kycStatus, twofaSecret } }

// -- Auth endpoints (register/login) --
const bcrypt = require('bcrypt');

app.post('/api/register', async (req, res) => {
  const { email, password, wallet } = req.body;
  if (users[email]) return res.status(400).json({ error: 'exists' });
  const hash = await bcrypt.hash(password, 10);
  users[email] = { passwordHash: hash, wallet, kycStatus: 'pending', twofaEnabled: false };
  res.json({ ok: true });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const u = users[email];
  if (!u) return res.status(400).json({ error: 'no user' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid' });
  const token = jwt.sign({ email, wallet: u.wallet }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// -- KYC stub (replace with SumSub/Onfido integration) --
app.post('/api/kyc/submit', (req, res) => {
  const { email } = req.body;
  if (!users[email]) return res.status(400).json({ error: 'no user' });
  users[email].kycStatus = 'submitted';
  // in real integrate with provider and set status asynchronously via webhook
  res.json({ ok: true });
});

app.get('/api/kyc/status/:email', (req, res) => {
  const u = users[req.params.email];
  if (!u) return res.status(404).json({ error: 'no user' });
  res.json({ kycStatus: u.kycStatus || 'none' });
});

// -- Mining claim signer endpoint (server signs EIP-712 typed data) --
app.post('/api/mining/sign', async (req, res) => {
  // Validate request and KYC etc. For demo we sign with a local private key (not safe for prod).
  const { user, amount, period, nonce, deadline } = req.body;
  // In prod: check user KYC, cooldown, daily cap, nonces, etc.
  const signerPk = process.env.MINING_SIGNER_PRIVATE_KEY;
  if (!signerPk) return res.status(500).json({ error: 'signer not configured' });

  const wallet = new ethers.Wallet(signerPk);

  const domain = {
    name: "LoX-MiningRewards",
    version: "1",
    chainId: 11155111, // Sepolia
    verifyingContract: process.env.MINING_CONTRACT_ADDRESS
  };

  const types = {
    Claim: [
      { name: "user", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "period", type: "uint256" },
      { name: "nonce", type: "bytes32" },
      { name: "deadline", type: "uint256" }
    ]
  };

  const value = { user, amount, period, nonce, deadline };

  const signature = await wallet._signTypedData(domain, types, value);
  res.json({ signature });
});

app.listen(PORT, () => console.log('API running on', PORT));
