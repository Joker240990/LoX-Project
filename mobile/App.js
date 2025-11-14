import React, {useState} from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { ethers } from 'ethers';

// Minimal screen for mobile wallet integration & balance display
export default function App() {
  const [address, setAddress] = useState('');
  const [loxAddr, setLoxAddr] = useState('');
  const [balance, setBalance] = useState('0');

  async function getBalance() {
    if (!loxAddr || !address) return alert('set both addresses');
    const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_KEY');
    const abi = ["function balanceOf(address) view returns (uint256)"];
    const contract = new ethers.Contract(loxAddr, abi, provider);
    const b = await contract.balanceOf(address);
    setBalance(ethers.formatUnits(b, 18));
  }

  return (
    <View style={{padding:20}}>
      <Text>LoX Mobile</Text>
      <TextInput placeholder="Your wallet address" onChangeText={setAddress} value={address} />
      <TextInput placeholder="LoX contract address" onChangeText={setLoxAddr} value={loxAddr} />
      <Button title="Get Balance" onPress={getBalance} />
      <Text>Balance: {balance}</Text>
    </View>
  );
}
