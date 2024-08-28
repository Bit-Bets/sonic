import React, { useState, useEffect } from 'react';
import './App.css';
import { web3, BettingABI } from './web3Utils';

function App() {
  const [contractAddress, setContractAddress] = useState('');
  const [contract, setContract] = useState(null);
  const [contractBalance, setContractBalance] = useState('0.00 ETH');
  const [teamAName, setTeamAName] = useState('Time A');
  const [teamBName, setTeamBName] = useState('Time B');
  const [betAmount, setBetAmount] = useState('');
  const [oddA, setOddA] = useState('1.00');
  const [oddB, setOddB] = useState('1.00');
  const [totalReturn, setTotalReturn] = useState('0.00');
  const [balance, setBalance] = useState('0.00 ETH');
  const [team, setTeam] = useState('');

  useEffect(() => {
    const selectedOdd = team === teamAName ? oddA : team === teamBName ? oddB : 1;
    const formattedAmount = parseFloat(betAmount) || 0;
    setTotalReturn((formattedAmount * selectedOdd).toFixed(2));
  }, [betAmount, team, oddA, oddB, teamAName, teamBName]);

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

  const fetchContractDetails = async () => {
    try {
      if (contract) {
        console.log('Fetching team names...');
        const teamA = await contract.methods.getTeamAName().call();
        const teamB = await contract.methods.getTeamBName().call();
        setTeamAName(teamA);
        setTeamBName(teamB);

        console.log('Fetching odds for Team A...');
        const oddA = await contract.methods.viewOdds(1).call();
        console.log('Odd A:', oddA.toString());  // Converte BigInt para String
        setOddA((Number(oddA) / 10).toFixed(2));  // Converte para número antes de calcular

        console.log('Fetching odds for Team B...');
        const oddB = await contract.methods.viewOdds(2).call();
        console.log('Odd B:', oddB.toString());  // Converte BigInt para String
        setOddB((Number(oddB) / 10).toFixed(2));  // Converte para número antes de calcular
      }
    } catch (error) {
      console.error('Error fetching contract details:', error);
    }
  };

  const fetchContractBalance = async () => {
    try {
      if (contractAddress && web3.utils.isAddress(contractAddress)) {
        const balanceInWei = await web3.eth.getBalance(contractAddress);
        const balanceInEth = web3.utils.fromWei(balanceInWei, 'ether');
        setContractBalance(`${balanceInEth} ETH`);
      }
    } catch (error) {
      console.error('Error fetching contract balance:', error);
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
      await fetchContractBalance();
    }, 1000);

    return () => clearInterval(balanceInterval);
  }, [contractAddress]);

  // Aqui adicionamos o intervalo para atualizar os detalhes do contrato a cada 1 segundo
  useEffect(() => {
    if (contract) {
      fetchContractDetails(); // Fetch initial contract details when contract is set

      const contractDetailsInterval = setInterval(fetchContractDetails, 1000); // Atualiza as odds a cada 1 segundo

      return () => clearInterval(contractDetailsInterval); // Limpa o intervalo quando o componente é desmontado
    }
  }, [contract]);

  const handleContractAddressChange = (e) => {
    setContractAddress(e.target.value);
  };

  const handleConfirmAddress = async () => {
    if (web3.utils.isAddress(contractAddress)) {
      const newContract = new web3.eth.Contract(BettingABI, contractAddress);
      setContract(newContract);
      console.log(`Endereço do contrato definido: ${contractAddress}`);
      await fetchContractDetails(); // Fetch details immediately after confirming address
      await fetchContractBalance();
    } else {
      alert('Por favor, insira um endereço válido de contrato.');
    }
  };

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
    if (!contract) {
      alert('Por favor, insira um endereço de contrato válido.');
      return;
    }

    if (team && parseFloat(betAmount) > 0) {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      const balanceInWei = await web3.eth.getBalance(account);
      const balance = web3.utils.fromWei(balanceInWei, 'ether');
      console.log(`Saldo da conta: ${balance} ETH`);
      console.log(`Saldo da conta (Wei): ${balanceInWei}`);

      const amountInWei = web3.utils.toWei(betAmount, 'ether');
      console.log(`Valor da aposta (Wei): ${amountInWei}`);

      if (amountInWei > balanceInWei.toString()) {
        alert('Saldo insuficiente para realizar a aposta.');
        return;
      }

      try {
        await contract.methods.placeBet(team === teamAName ? 1 : 2, amountInWei)
            .send({
                from: account,
                value: amountInWei,
                gas: 5000000, // Aumentado para testar
                gasPrice: web3.utils.toWei('20', 'gwei')
            });
        alert(`Você apostou ETH ${betAmount} no ${team}. Possível retorno: ETH ${totalReturn}`);
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
      {!contract ? (
        <div className="contract-address-container">
          <h2>Insira o endereço do contrato</h2>
          <input
            type="text"
            placeholder="Digite o endereço do contrato"
            value={contractAddress}
            onChange={handleContractAddressChange}
          />
          <button onClick={handleConfirmAddress}>Confirmar</button>
        </div>
      ) : (
        <div>
          <div className="wallet-balance">
            <p>Saldo da carteira:</p>
            <p>{balance}</p>
          </div>
          <div className="contract-balance">
            <p>Saldo do contrato:</p>
            <p>{contractBalance}</p>
          </div>
          <h1>Bit Bets</h1>
          <p>Para ganhar:</p>
          <div className="button-container">
            <div>
              <button
                className={team === teamAName ? 'selected' : ''}
                onClick={() => handleTeamClick(teamAName)}
              >
                {teamAName}
              </button>
              <p>ODD: {oddA}</p>
            </div>
            <div>
              <button
                className={team === teamBName ? 'selected' : ''}
                onClick={() => handleTeamClick(teamBName)}
              >
                {teamBName}
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
            <p>Possível Retorno: ETH {totalReturn}</p>
          </div>
          <div>
            <button onClick={handleBet}>Apostar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
