import Web3 from 'web3';
import BettingABI from './BettingABI.json'; // Certifique-se de que o caminho está correto

let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  
  // Solicita contas ao usuário
  window.ethereum.request({ method: 'eth_requestAccounts' })
    .then((accounts) => {
      if (accounts.length === 0) {
        console.warn('No accounts found. Please connect to MetaMask.');
      } else {
        console.log('Connected account:', accounts[0]);
      }
    })
    .catch((error) => {
      console.error('User denied account access', error);
    });

  // Detecta mudanças na conta ou na rede
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
      console.warn('Please connect to MetaMask.');
    } else {
      console.log('Account changed:', accounts[0]);
      window.location.reload(); // Recarrega a página ao detectar mudança na conta
    }
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload(); // Recarrega a página ao detectar mudança na rede
  });

} else {
  if (window.confirm('Por favor, instale o MetaMask para usar esta aplicação. Você gostaria de visitar a página de download?')) {
    window.open('https://metamask.io/download/', '_blank');
  } else {
    console.error('MetaMask is required to use this application.');
  }
}

// Verifica se web3 foi inicializado corretamente
if (!web3) {
  console.error('web3 not initialized. Please ensure MetaMask is installed and connected.');
}

export { web3, BettingABI };
