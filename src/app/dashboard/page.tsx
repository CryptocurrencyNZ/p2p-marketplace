"use client";

import P2PCryptoTradeContainer from "@/components/Map/container";
import { motion } from "framer-motion";

const Page = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full h-full"
      >
        <P2PCryptoTradeContainer />
      </motion.div>
    </div>
  );
};
export default Page;