import { useEffect, useState } from "react";
import { PublicClient } from "viem";

export default function useBlockTimestamp(
  publicClient: PublicClient
): number | null {
  const [blockTimestamp, setBlockTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const fetchBlockTimestamp = async () => {
      try {
        const block = await publicClient.getBlock();
        setBlockTimestamp(Number(block.timestamp.toString() + "000") + 60000);
      } catch (error) {
        console.log("getBlock error", error);
      }
    };

    fetchBlockTimestamp();
  }, [publicClient]);

  return blockTimestamp;
}
