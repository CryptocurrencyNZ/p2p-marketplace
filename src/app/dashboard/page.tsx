"use client";

import P2PCryptoTradeMap from "@/components/Listings/listing";
import { motion } from "framer-motion";

const Page = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="w-full mb-8"
      >
        <P2PCryptoTradeMap />
      </motion.div>
    </div>
  );
};
export default Page;
