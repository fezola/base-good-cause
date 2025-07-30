/**
 * Utility to verify real USDC transactions on Base blockchain
 */

const BASE_RPC_URL = 'https://mainnet.base.org';
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base mainnet

export interface TransactionVerification {
  isValid: boolean;
  isUSDC: boolean;
  amount: number;
  recipient: string;
  sender: string;
  blockNumber: number;
  error?: string;
}

export const verifyUSDCTransaction = async (
  txHash: string,
  expectedRecipient: string,
  expectedAmount: number
): Promise<TransactionVerification> => {
  try {
    // Basic validation
    if (!txHash || !txHash.startsWith('0x') || txHash.length !== 66) {
      return {
        isValid: false,
        isUSDC: false,
        amount: 0,
        recipient: '',
        sender: '',
        blockNumber: 0,
        error: 'Invalid transaction hash format'
      };
    }

    // Fetch transaction details from Base RPC
    const response = await fetch(BASE_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1,
      }),
    });

    const data = await response.json();
    
    if (!data.result) {
      return {
        isValid: false,
        isUSDC: false,
        amount: 0,
        recipient: '',
        sender: '',
        blockNumber: 0,
        error: 'Transaction not found on blockchain'
      };
    }

    const tx = data.result;

    // Verify it's a USDC transaction
    if (tx.to.toLowerCase() !== USDC_CONTRACT.toLowerCase()) {
      return {
        isValid: false,
        isUSDC: false,
        amount: 0,
        recipient: tx.to,
        sender: tx.from,
        blockNumber: parseInt(tx.blockNumber, 16),
        error: 'Transaction is not to USDC contract'
      };
    }

    // Decode USDC transfer data
    const inputData = tx.input;
    if (!inputData.startsWith('0xa9059cbb')) { // transfer function signature
      return {
        isValid: false,
        isUSDC: true,
        amount: 0,
        recipient: '',
        sender: tx.from,
        blockNumber: parseInt(tx.blockNumber, 16),
        error: 'Transaction is not a USDC transfer'
      };
    }

    // Extract recipient and amount from transaction data
    const recipientHex = '0x' + inputData.slice(34, 74);
    const amountHex = '0x' + inputData.slice(74, 138);
    
    const recipient = recipientHex.toLowerCase();
    const amount = parseInt(amountHex, 16) / 1000000; // USDC has 6 decimals

    // Verify recipient matches expected
    const expectedRecipientLower = expectedRecipient.toLowerCase();
    if (recipient !== expectedRecipientLower) {
      return {
        isValid: false,
        isUSDC: true,
        amount: amount,
        recipient: recipient,
        sender: tx.from,
        blockNumber: parseInt(tx.blockNumber, 16),
        error: `Recipient mismatch. Expected: ${expectedRecipient}, Got: ${recipient}`
      };
    }

    // Verify amount matches expected (allow small tolerance for rounding)
    const tolerance = 0.01; // 1 cent tolerance
    if (Math.abs(amount - expectedAmount) > tolerance) {
      return {
        isValid: false,
        isUSDC: true,
        amount: amount,
        recipient: recipient,
        sender: tx.from,
        blockNumber: parseInt(tx.blockNumber, 16),
        error: `Amount mismatch. Expected: ${expectedAmount}, Got: ${amount}`
      };
    }

    // All checks passed - this is a valid USDC transaction
    return {
      isValid: true,
      isUSDC: true,
      amount: amount,
      recipient: recipient,
      sender: tx.from,
      blockNumber: parseInt(tx.blockNumber, 16)
    };

  } catch (error) {
    return {
      isValid: false,
      isUSDC: false,
      amount: 0,
      recipient: '',
      sender: '',
      blockNumber: 0,
      error: `Verification failed: ${error.message}`
    };
  }
};

export const isValidTransactionHash = (txHash: string): boolean => {
  return txHash && 
         typeof txHash === 'string' && 
         txHash.startsWith('0x') && 
         txHash.length === 66 &&
         /^0x[a-fA-F0-9]{64}$/.test(txHash);
};
