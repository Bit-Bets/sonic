import React, { useState, useEffect } from 'react';
import './App.css';
import { web3, contract } from './web3Utils';

function App() {
  const [team, setTeam] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [oddA, setOddA] = useState((Math.random() * (3 - 1.5) + 1.5).toFixed(2));
  const [oddB, setOddB] = useState((Math.random() * (3 - 1.5) + 1.5).toFixed(2));
  const [totalReturn, setTotalReturn] = useState('0.00');
  const [balance, setBalance] = useState('0.00 ETH');

  useEffect(() => {
    const selectedOdd = team === 'Time A' ? oddA : team === 'Time B' ? oddB : 1;
    const formattedAmount = parseFloat(betAmount) || 0;
    setTotalReturn((formattedAmount * selectedOdd).toFixed(2));
  }, [betAmount, team, oddA, oddB]);

  const fetchBalance = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        const account = accounts[0];
        const balanceInWei = await web3.eth.getBalance(account);
        const balanceInEth = web3.utils.fromWei(balanceInWei, 'ether');
        setBalance(`${balanceInEth} ETH`);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    const connectWallet = async () => {
      try {
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          await fetchBalance(); 
        } else {
          alert('Por favor, instale o MetaMask para usar esta aplicação.');
        }
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    };

    connectWallet();

    const balanceInterval = setInterval(async () => {
      await fetchBalance();
    }, 1000);

    return () => clearInterval(balanceInterval);
  }, []);

  const handleTeamClick = (selectedTeam) => {
    setTeam(selectedTeam);
  };

  const handleBetAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
    }
  };

  const handleBet = async () => {
    if (team && parseFloat(betAmount) > 0) {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const balanceInWei = await web3.eth.getBalance(account);
      const balance = web3.utils.fromWei(balanceInWei, 'ether');
      console.log(`Saldo da conta: ${balance} ETH`);
      console.log(`Saldo da conta (Wei): ${balanceInWei}`);
  
      const amountInWei = web3.utils.toWei(betAmount, 'ether');
      if (parseFloat(amountInWei) > parseFloat(balanceInWei)) {
        alert('Saldo insuficiente para realizar a aposta.');
        return;
      }
  
      try {
        await contract.methods.placeBet(team === 'Time A' ? 1 : 2)
          .send({ 
            from: account, 
            value: amountInWei,
            gas: 3000000,
            gasPrice: web3.utils.toWei('20', 'gwei')
          });
        alert(`Você apostou R$ ${betAmount} no ${team}. Possível retorno: R$ ${totalReturn}`);
      } catch (error) {
        alert('Erro ao realizar a aposta. Verifique se você tem fundos suficientes.');
        console.error('Erro ao realizar a aposta:', error);
      }
    } else {
      alert('Por favor, selecione um time e insira um valor para apostar.');
    }
  };

  return (
    <div className="App">
      <div className="wallet-balance">
        <p>Saldo da carteira:</p>
        <p>{balance}</p>
      </div>
      <h1>Bit Bets</h1>
      <p>Para ganhar:</p>
      <div className="button-container">
        <div>
          <button
            className={team === 'Time A' ? 'selected' : ''}
            onClick={() => handleTeamClick('Time A')}
          >
            Time A
          </button>
          <p>ODD: {oddA}</p>
        </div>
        <div>
          <button
            className={team === 'Time B' ? 'selected' : ''}
            onClick={() => handleTeamClick('Time B')}
          >
            Time B
          </button>
          <p>ODD: {oddB}</p>
        </div>
      </div>
      <div>
        <input
          type="text"
          placeholder="Digite o valor"
          value={betAmount}
          onChange={handleBetAmountChange}
        />
      </div>
      <div>
        <p>Possível Retorno: R$ {totalReturn}</p>
      </div>
      <div>
        <button onClick={handleBet}>Apostar</button>
      </div>
    </div>
  );
}

export default App;
