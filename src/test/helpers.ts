import { ethers } from "hardhat";
import { Oracle } from "../type/Oracle";
import { MaltDAO } from "../type/MaltDAO";
import { LiquidityMine } from "../type/LiquidityMine";

export async function mineBlocks(amount: number) {
  for (let i = 0; i < amount; i++) {
    await ethers.provider.send('evm_mine', []);
  }
}

export async function increaseTime(amount: number) {
  await ethers.provider.send('evm_increaseTime', [amount]);
  await mineBlocks(1);
}

export async function setNextBlockTime(timestamp: number) {
  await ethers.provider.send('evm_setNextBlockTimestamp', [timestamp]);
}

export async function hardhatSnapshot() {
  return await ethers.provider.send('evm_snapshot', []);
}

export async function hardhatRevert(snapshotId: string) {
  return await ethers.provider.send('evm_revert', [snapshotId]);
}

export async function advanceDAO(dao: MaltDAO, periods: number, epochLength: number) {

  for (let i = 0; i < periods + 1; i++) {
    await increaseTime(epochLength);
    await dao.advance();
  }
}

export async function advanceOracleEpochs(oracle: Oracle, tokenAddress: string, epochs: number, epochLength: number, mockDAO: any, initialEpoch: number = 0): Promise<number> {

  for (let i = 0; i < epochs; i++) {
    await increaseTime(epochLength);
    await mockDAO.mock.epoch.returns(initialEpoch + i + 1);
    await oracle.update(tokenAddress);
  }
  return initialEpoch + epochs;
}

export function oracleAdvancerFactory(oracle: Oracle, tokenAddress: string, epochLength: number, mockDAO: any): any {
  let currentEpoch = 0;
  return async function(epochs: number) {
    currentEpoch = await advanceOracleEpochs(oracle, tokenAddress, epochs, epochLength, mockDAO, currentEpoch);
    return currentEpoch
  }
}

export async function advanceLpPool(lpmine: LiquidityMine, epochLength: number, epochs: number, mockDAO: any, initialEpoch: number = 0): Promise<number> {

  for (let i = 0; i < epochs; i++) {
    await increaseTime(epochLength);
    await mockDAO.mock.epoch.returns(initialEpoch + i + 1);
    await lpmine.advance();
  }
  return initialEpoch + epochs;
}

export function lpPoolAdvancerFactory(lpmine: LiquidityMine, epochLength: number, mockDAO: any): any {
  let currentEpoch = 0;
  return async function(epochs: number) {
    currentEpoch = await advanceLpPool(lpmine, epochLength, epochs, mockDAO, currentEpoch);
    return currentEpoch
  }
}
