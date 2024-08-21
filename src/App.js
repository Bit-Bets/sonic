// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import web3 from './web3';
import bettingContract from './BettingContract';

function App() {
  const [team, setTeam] = useState('');
  const [betAmount, setBetAmount] = useState('0.00');
  const [oddA, setOddA] = useState((Math.random() * (3 - 1.5) + 1.5).toFixed(2));
  const [oddB, setOddB] = useState((Math.random() * (3 - 1.5) + 1.5).toFixed(2));
  const [totalReturn, setTotalReturn] = useState('0.00');
  const [account, setAccount] = useState('');

  useEffect(() => {
    // Conectar a conta do MetaMask
    const loadAccount = async () => {
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
    };

    loadAccount();
  }, []);

  useEffect(() => {
    const selectedOdd = team === 'Time A' ? oddA : team === 'Time B' ? oddB : 1;
    setTotalReturn((betAmount * selectedOdd).toFixed(2));
  }, [betAmount, team, oddA, oddB]);

  const handleTeamClick = (selectedTeam) => {
    setTeam(selectedTeam);
  };

  const formatCurrency = (value) => {
    const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
    return (numericValue / 100).toFixed(2);
  };

  const handleBetAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 6) {
      setBetAmount(formatCurrency(rawValue));
    }
  };

  const handleBet = async () => {
    if (team && betAmount > 0) {
      try {
        await bettingContract.methods.placeBet(team === 'Time A' ? 1 : 2).send({
          from: account,
          value: web3.utils.toWei(betAmount, 'ether')
        });
        alert(`Você apostou R$ ${betAmount} no ${team}. Possível retorno: R$ ${totalReturn}`);
      } catch (error) {
        alert('Erro ao fazer a aposta. Verifique o console para detalhes.');
        console.error(error);
      }
    } else {
      alert('Por favor, selecione um time e insira um valor para apostar.');
    }
  };

  return (
    <div className="App">
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
          placeholder="R$ 0,00"
          value={`R$ ${betAmount}`}
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
