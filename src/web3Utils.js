// src/web3Utils.js
import Web3 from 'web3';
import BettingABI from './BettingABI.json'; // ABI do contrato

const CONTRACT_ADDRESS = '0xf844706ce65e501b8f1435b24f05fe734a0beb3d'; // Endereço do contrato na blockchain

let web3;
let contract;

if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  window.ethereum.request({ method: 'eth_requestAccounts' });
  contract = new web3.eth.Contract(BettingABI, CONTRACT_ADDRESS);
} else {
  alert('Por favor, instale o MetaMask para usar esta aplicação.');
}

export { web3, contract };
