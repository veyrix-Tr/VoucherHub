import { ethers } from "ethers";
import addresses from "@contracts/exports/addresses/addresses.js";
import merchantRegistryAbi from '@contracts/exports/abi/MerchantRegistry.json';

export const detectUserRole = async (walletAddress, provider) => {
  try {
    const chainId = provider._network?.chainId || parseInt(import.meta.env.VITE_CHAIN_ID || "11155111", 10);
    
    const merchantRegistryAddress = addresses[chainId]?.merchantRegistry;
    if (!merchantRegistryAddress) {
      console.warn('Merchant registry address not found for chain', chainId);
      return 'user';
    }

    const merchantRegistry = new ethers.Contract(
      merchantRegistryAddress,
      merchantRegistryAbi,
      provider
    );
    
    try {
      const adminAddress = await merchantRegistry.owner();
      if (walletAddress.toLowerCase() === adminAddress.toLowerCase()) {
        return 'admin';
      }
    } catch (error) {
      console.error('Error getting admin address:', error);
    }
    
    try {
      const isMerchant = await merchantRegistry.isMerchant(walletAddress);
      if (isMerchant) {
        return 'merchant';
      }
    } catch (error) {
      console.error('Error checking merchant status:', error);
    }
    
    return 'user';
  } catch (error) {
    console.error('Error detecting user role:', error);
    return 'user';
  }
};
