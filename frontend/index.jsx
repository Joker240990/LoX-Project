import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ethers } from "ethers";

const LOX_ABI = [ "function releasePartnerReserve() external", "function balanceOf(address) view returns (uint256)" ];

function App() {
  const [provider, setProvider] = useState(null);
  const [addr, setAddr] = useState("");
  const [loxAddr, setLoxAddr] = useState("");
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);
    }
  }, []);

  async function connect() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const p = new ethers.BrowserProvider(window.ethereum);
    const signer = await p.getSigner();
    const address = await signer.getAddress();
    setAddr(address);
  }

  async function getBalance() {
    if (!provider || !loxAddr) return alert('Set LOX address');
    const contract = new ethers.Contract(loxAddr, LOX_ABI, provider);
    const b = await contract.balanceOf(addr);
    setBalance(ethers.formatUnits(b, 18));
  }

  async function releasePartner() {
    if (!provider || !loxAddr) return alert('Set LOX address');
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(loxAddr, LOX_ABI, signer);
    const tx = await contract.releasePartnerReserve();
    await tx.wait();
    alert('Partner reserve released (tx pending mined)');
  }

  return (
    <div style={{padding:20}}>
      <h1>LoX Dashboard</h1>
      <button onClick={connect}>Connect MetaMask</button>
      <div> Address: {addr}</div>
      <div style={{marginTop:10}}>
        <input placeholder="LoX contract address" value={loxAddr} onChange={e=>setLoxAddr(e.target.value)} />
        <button onClick={getBalance}>Get Balance</button>
      </div>
      <div>Balance: {balance}</div>
      <div style={{marginTop:20}}>
        <button onClick={releasePartner}>releasePartnerReserve (owner-only)</button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
