import { ethers } from "ethers";

const getPoolRatio = (r0: string, r1: string, d0: number, d1: number) => {
  const amount0 = parseFloat(ethers.formatUnits(r0, d0));
  const amount1 = parseFloat(ethers.formatUnits(r1, d1));
  const pr = amount0 / amount1;
  return pr;
};

export default getPoolRatio;
