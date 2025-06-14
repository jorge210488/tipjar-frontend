import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

const abi = [
  "function tip(string message) payable",
  "function withdraw()",
  "function owner() view returns (address)",
  "function getTipsCount() view returns (uint)",
  "function tips(uint index) view returns (address, uint, string, uint)",
  "function getAllTips() view returns (tuple(address tipper, uint amount, string message, uint timestamp)[])",
];

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [message, setMessage] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<string>("0.01");
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      // Pedir conexión explícita
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setSelectedAccount(accounts[0]);

      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await ethProvider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      setProvider(ethProvider);
      setContract(contract);
    };

    setupProvider();

    // Escuchar cambio de cuenta
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await ethProvider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        setProvider(ethProvider);
        setContract(contract);
        setSelectedAccount(accounts[0]);

        getBalance();
        getTips();
      } else {
        setProvider(null);
        setContract(null);
        setSelectedAccount(null);
        setContractBalance("0");
        setTips([]);
      }
    };

    window.ethereum?.on("accountsChanged", handleAccountsChanged);

    // Cleanup al desmontar
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  // Siempre verificar eth_accounts cuando cambia el provider
  useEffect(() => {
    const checkAccounts = async () => {
      if (!window.ethereum) return;
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      setSelectedAccount(accounts[0] || null);
    };

    if (provider) {
      checkAccounts();
    }
  }, [provider]);

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
      const tipsArray = await contract.getAllTips();

      const formattedTips = tipsArray.map((tip: any) => ({
        from: tip.tipper,
        amount: Number(ethers.formatEther(tip.amount)),
        message: tip.message,
        timestamp: Number(tip.timestamp),
      }));

      setTips(formattedTips.reverse());
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const tx = await contract.withdraw();
      await tx.wait();
      alert("Fondos retirados!");
      getBalance();
      getTips();
    } catch (err) {
      console.error(err);
      alert("Error al retirar fondos (¿eres el owner?)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🎁 TipJar</h1>
      <p>Balance del Contrato: {contractBalance} ETH</p>
      <p>
        Cuenta conectada:{" "}
        {selectedAccount
          ? `${selectedAccount.substring(0, 6)}...${selectedAccount.substring(
              selectedAccount.length - 4
            )}`
          : "Ninguna"}
      </p>

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
        disabled={isLoading}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#3498db", // azul
          color: "white",
          border: "none",
          opacity: isLoading ? 0.6 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Enviando..." : "Enviar propina"}
      </button>

      <button
        onClick={withdrawFunds}
        disabled={isLoading}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          opacity: isLoading ? 0.6 : 1,
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Retirando..." : "Retirar fondos (owner)"}
      </button>
      <p style={{ marginTop: "2rem" }}>
        {selectedAccount
          ? "Tu billetera está conectada."
          : "Conecta tu billetera (Metamask) para interactuar."}
      </p>

      {/* Mostrar lista de propinas */}
      <div style={{ marginTop: "2rem" }}>
        <h2>💌 Propinas recibidas:</h2>

        {/* SPINNER LOADING */}
        {isLoading && (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <div className="loader"></div>
            <p>Procesando transacción...</p>
          </div>
        )}

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
