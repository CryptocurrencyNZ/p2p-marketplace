// import { useEffect } from "react";
// import { Signer, ethers } from "ethers";
// import { ESCROW_ABI, ESCROW_ADDRESS } from "@/constants";

// interface FundsReleasedListenerProps {
//   signer: Signer | null;
//   sellerAddress: string;
//   onNotification: (message: string) => void;
// }

// // listener needs to be setup to be sent to the buyer once the seller releases crypto (Step 3)
// function FundsReleasedListener({ signer, sellerAddress, onNotification }: FundsReleasedListenerProps) {
//   useEffect(() => {
//     if (!signer || !sellerAddress) return;

//     const provider = signer.provider;
//     const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);

//     const handleFundsReleased = (seller: string, tradeId: bigint) => {
//       if (seller.toLowerCase() === sellerAddress.toLowerCase()) {
//         onNotification(`Funds released successfully for Trade ID ${tradeId.toString()}.`);
//       }
//     };

//     contract.on("FundsReleased", handleFundsReleased);

//     return () => {
//       contract.off("FundsReleased", handleFundsReleased);
//     };
//   }, [signer, sellerAddress]);

//   return null;
// }

// export default FundsReleasedListener;
