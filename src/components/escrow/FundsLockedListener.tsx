import { useEffect } from "react";
import { Signer, ethers } from "ethers";
import { ESCROW_ABI, ESCROW_ADDRESS } from "@/constants";

interface FundsLockedListenerProps {
  signer: Signer | null;
  buyerAddress: string; // Connected user's address
  onNotification: (message: string) => void;
}

// listener needs to be setup to be sent to the buyer once the seller lcoks the Crypto (Step 1)
function FundsLockedListener({ signer, buyerAddress, onNotification }: FundsLockedListenerProps) {
  useEffect(() => {
    if (!signer || !buyerAddress) return;

    const provider = signer.provider;
    const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);

    const handleFundsLocked = (seller: string, buyer: string, token: string, amount: bigint, tradeId: bigint) => {
      if (buyer.toLowerCase() === buyerAddress.toLowerCase()) {
        onNotification(`Crypto locked! Trade ID ${tradeId.toString()}. Please send the fiat.`);
      }
    };

    contract.on("FundsLocked", handleFundsLocked);

    return () => {
      contract.off("FundsLocked", handleFundsLocked);
    };
  }, [signer, buyerAddress]);

  return null;
}

export default FundsLockedListener;
