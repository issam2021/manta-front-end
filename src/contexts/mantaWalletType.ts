// TODO will use a npm package for all these types in the future
import type { Unsubcall } from '@polkadot/extension-inject/types';
import type { HexString } from '@polkadot/util/types';

export type Network = string;
export interface PrivateWalletStateInfo {
  isWalletInitialized: boolean;
  isWalletAuthorized: boolean;
  isWalletReady: boolean;
  isWalletBusy: boolean;
}
export interface RequestBasePayload {
  assetId: string;
  network: Network;
}
export interface RequestMultiZkBalancePayload {
  assetIds: string[];
  network: Network;
}
export interface RequestTransactionPayload extends RequestBasePayload {
  amount: string;
  polkadotAddress: string;
}
export interface RequestTransferTransactionPayload
  extends RequestTransactionPayload {
  toZkAddress: string;
}
export interface ResponseBuildMultiSbt {
  transactionDatas: any;
  batchedTx: HexString;
}
export type RequestSbtInfo = {
  assetId: string;
  amount?: string;
  signature?: string;
  metadata?: string;
};
export type PrivateWallet = {
  getWalletState(): Promise<PrivateWalletStateInfo>;
  walletSync(): Promise<boolean>;
  getZkBalance(payload: RequestBasePayload): Promise<string | null>;
  getMultiZkBalance(
    payload: RequestMultiZkBalancePayload
  ): Promise<string[] | null>;
  toPrivateBuild(payload: RequestTransactionPayload): Promise<string[] | null>;
  privateTransferBuild(
    payload: RequestTransferTransactionPayload
  ): Promise<string[] | null>;
  toPublicBuild(payload: RequestTransactionPayload): Promise<string[] | null>;
  subscribeWalletState: (
    cb: (state: PrivateWalletStateInfo) => void | Promise<void>
  ) => Unsubcall;
};
