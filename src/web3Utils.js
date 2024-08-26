import Web3 from 'web3';
import BettingABI from './BettingABI.json'; // ABI do contrato

const CONTRACT_ADDRESS = '0xf844706ce65e501b8f1435b24f05fe734a0beb3d'; // Endereço do contrato na blockchain

let web3;
let contract;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  window.ethereum.request({ method: 'eth_requestAccounts' })
    .then(() => {
      contract = new web3.eth.Contract(BettingABI, CONTRACT_ADDRESS);
    })
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

export { web3, contract };
