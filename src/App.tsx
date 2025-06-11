import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

const abi = [
  "function tip(string message) payable",
  "function withdraw()",
  "function owner() view returns (address)",
  "function getTipsCount() view returns (uint)",
  "function tips(uint index) view returns (address, uint, string, uint)",
];

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [message, setMessage] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<string>("0.01");
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [tips, setTips] = useState<
    { from: string; amount: number; message: string; timestamp: number }[]
  >([]);

  // Conecta Ethers
  useEffect(() => {
    const setupProvider = async () => {
      if (!window.ethereum) {
        alert("Please install Metamask!");
        return;
      }

      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethProvider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      setProvider(ethProvider);
      setContract(contract);
    };

    setupProvider();
  }, []);

  // Lee el balance del contrato
  const getBalance = async () => {
    if (!provider) return;

    const balance = await provider.getBalance(contractAddress);
    setContractBalance(ethers.formatEther(balance));
  };

  // lee lista de tips
  const getTips = async () => {
    if (!contract) return;

    try {
      const tipsLength = await contract.getTipsCount();
      const tipsArray = [];

      for (let i = 0; i < tipsLength; i++) {
        const tip = await contract.tips(i);
        tipsArray.push({
          from: tip[0],
          amount: Number(ethers.formatEther(tip[1])), // amount en ETH
          message: tip[2], // message
          timestamp: Number(tip[3]), // timestamp
        });
      }

      tipsArray.reverse();

      setTips(tipsArray);
    } catch (err) {
      console.error("Error cargando las propinas:", err);
    }
  };

  useEffect(() => {
    if (provider) {
      getBalance();
    }
  }, [provider]);

  // cuando hay contrato, leemos lista de tips
  useEffect(() => {
    if (contract) {
      getTips();
    }
  }, [contract]);

  // Envía propina
  const sendTip = async () => {
    if (!contract) return;

    try {
      const tx = await contract.tip(message, {
        value: ethers.parseEther(tipAmount),
      });
      await tx.wait();
      alert("Propina enviada!");
      getBalance();
      getTips();
    } catch (err) {
      console.error(err);
      alert("Transacción fallida");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🎁 TipJar</h1>
      <p>Balance del Contrato: {contractBalance} ETH</p>

      <div style={{ marginTop: "1rem" }}>
        <label>Mensaje:</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tu mensaje"
          style={{ marginLeft: "1rem" }}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Monto de la propina (ETH):</label>
        <input
          type="text"
          value={tipAmount}
          onChange={(e) => setTipAmount(e.target.value)}
          style={{ marginLeft: "1rem" }}
        />
      </div>

      <button
        onClick={sendTip}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        Enviar propina
      </button>

      <p style={{ marginTop: "2rem" }}>
        Conecta tu billetera (Metamask) para interactuar.
      </p>

      {/* Mostrar lista de propinas */}
      <div style={{ marginTop: "2rem" }}>
        <h2>💌 Propinas recibidas:</h2>
        {tips.length === 0 ? (
          <p>Sin propinas aún!</p>
        ) : (
          <ul>
            {tips.map((tip, index) => (
              <li key={index} style={{ marginBottom: "1rem" }}>
                <strong>De:</strong> {tip.from} <br />
                <strong>Monto:</strong> {tip.amount} ETH <br />
                <strong>Mensaje:</strong> {tip.message} <br />
                <strong>Fecha:</strong>{" "}
                {new Date(tip.timestamp * 1000).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
