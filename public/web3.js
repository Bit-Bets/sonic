// src/web3.js
import Web3 from 'web3';

// Verifica se o navegador tem o MetaMask instalado
const web3 = window.ethereum
  ? new Web3(window.ethereum)
  : new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

export default web3;
