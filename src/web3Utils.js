import Web3 from 'web3';
import BettingABI from './BettingABI.json'; // Certifique-se de que o caminho está correto

let web3;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  window.ethereum.request({ method: 'eth_requestAccounts' })
    .catch((error) => {
      console.error('User denied account access', error);
    });

  // Detecta mudanças na conta ou na rede
  window.ethereum.on('accountsChanged', () => {
    window.location.reload(); // Recarrega a página ao detectar mudança na conta
  });

  window.ethereum.on('chainChanged', () => {
    window.location.reload(); // Recarrega a página ao detectar mudança na rede
  });
} else {
  if (window.confirm('Por favor, instale o MetaMask para usar esta aplicação. Você gostaria de visitar a página de download?')) {
    window.open('https://metamask.io/download/', '_blank');
  }
}

export { web3, BettingABI };
