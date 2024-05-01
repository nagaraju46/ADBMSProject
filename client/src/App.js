import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import ErrorMessage from "./ErrorMessage";
import TxList from "./TxList";

function App() {
  const [depositValue, setDepositValue] = useState(0);
  const [greet, setGreet] = useState('');
  const [greetingValue, setGreetingValue] = useState();
  const [balance, setBalance] = useState();
  const [error, setError] = useState();
  const [txs, setTxs] = useState([]);

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const ABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_greeting",
          "type": "string"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "greet",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_greeting",
          "type": "string"
        }
      ],
      "name": "setGreeting",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
  const contract = new ethers.Contract(contractAddress, ABI, signer);  

  useEffect(() => {
    const requestAccounts = async () => {
      await provider.send("eth_requestAccounts", []);
    }
    
    const getGreeting = async () => {
      const greeting = await contract.greet();
      setGreet(greeting);
    }

    const getBalance = async () => {
      const balance = await provider.getBalance(contractAddress);
      setBalance(ethers.utils.formatEther(balance));
    }

    requestAccounts()
      .catch(console.error)
    getBalance()
      .catch(console.error)
    getGreeting()
      .catch(console.error)
  }, [])

  const handleDepositChange = (e) => {
    setDepositValue(e.target.value)
  }

  const handleGreetingChange = (e) => {
    setGreetingValue(e.target.value);
  }

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const ethValue = ethers.utils.parseEther(depositValue)
    const deposit = await contract.deposit({value: ethValue});
    await deposit.wait();
    const balance = await provider.getBalance(contractAddress);
    setBalance(ethers.utils.formatEther(balance));
  }

  const handleGreetingSubmit = async (e) => {
    e.preventDefault();
    await contract.setGreeting(greetingValue)
    setGreet(greetingValue);
    setGreetingValue('');
  }

  const startPayment = async ({ setError, setTxs, ether, addr }) => {
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");
  
      await window.ethereum.send("eth_requestAccounts");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      ethers.utils.getAddress(addr);
      const tx = await signer.sendTransaction({
        to: addr,
        value: ethers.utils.parseEther(ether)
      });
      console.log({ ether, addr });
      console.log("tx", tx);
      setTxs([tx]);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleSendSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setError();
    await startPayment({
      setError,
      setTxs,
      ether: data.get("ether"),
      addr: data.get("addr")
    });
  };

  return (
    <div className="container">
      <div className="row mt-5">

        <div className="col">
          <h3>{greet}</h3>
          <p>Contract Balance: {balance} ETH</p>
        </div>

        <div className="col">
          <div className="mb-3">
            <h4>Deposit ETH</h4>
            <form className="m-4" onSubmit={handleDepositSubmit}>
              <div className="mb-3">
                <input type="number" className="form-control" placeholder="0" onChange={handleDepositChange} value={depositValue} />
              </div>
              <div className="d-grid gap-2">
                <button variant="secondary" size="lg" type="submit" className="btn btn-success">Deposit</button>
              </div>          
            </form>

            <h4 className="mt-3">Change Greeting</h4>
            <form className="m-4" onSubmit={handleGreetingSubmit}>
              <div className="mb-3">
                <input type="text" className="form-control" placeholder="" onChange={handleGreetingChange} value={greetingValue} />
              </div>
              <div className="d-grid gap-2">
                <button variant="secondary" size="lg" type="submit" className="btn btn-dark">Change</button>
              </div>
              
            </form>

            <h4 className="mt-3">SEND ETH PAYMENT</h4>
            <form className="m-4" onSubmit={handleSendSubmit}>
              <div className="mb-3">
                <input type="text" name="addr" className="form-control" placeholder="Recipient Address" />
              </div>
              <div className="mb-3">
                <input type="text" name="ether" className="form-control" placeholder="Amount in ETH"/>
              </div>
              <div className="d-grid gap-2">
                <button variant="secondary" size="lg" type="submit" className="btn btn-dark btn-primary">Pay Now</button>
                <ErrorMessage message={error} />
                <TxList txs={txs} />  
              </div>
                    
            </form>       
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
