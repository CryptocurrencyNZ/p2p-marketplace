// import { useEffect } from "react";
// import { Signer, ethers } from "ethers";
// import { ESCROW_ABI, ESCROW_ADDRESS } from "@/constants";

// interface FiatMarkedSentListenerProps {
//   signer: Signer | null;
//   sellerAddress: string;
//   onNotification: (message: string) => void;
// }

// // listener needs to be setup to be sent to the seller once the buyer sends the fiat (step2)
// function FiatMarkedSentListener({ signer, sellerAddress, onNotification }: FiatMarkedSentListenerProps) {
//   useEffect(() => {
//     if (!signer || !sellerAddress) return;

//     const provider = signer.provider;
//     const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);

//     const handleFiatMarkedSent = (buyer: string, tradeId: bigint) => {
//       onNotification(`Fiat marked as sent for Trade ID ${tradeId.toString()}. Please verify receipt before releasing funds.`);
//     };

//     contract.on("FiatMarkedSent", handleFiatMarkedSent);

//     return () => {
//       contract.off("FiatMarkedSent", handleFiatMarkedSent);
//     };
//   }, [signer, sellerAddress]);

//   return null;
// }

// export default FiatMarkedSentListener;
