import { SubmittableExtrinsic } from '@polkadot/api/types';
import { EventRecord, ExtrinsicStatus } from '@polkadot/types/interfaces';
import { BN } from 'bn.js';
import WALLET_NAME from 'constants/WalletConstants';
import {
  MutableRefObject,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import TxStatus from 'types/TxStatus';
import { getSubstrateWallets } from 'utils';
import { removePendingTxHistoryEvent } from 'utils/persistence/privateTransactionHistory';
import { useConfig } from './configContext';
import { useGlobal } from './globalContexts';
import { PrivateWallet } from './mantaWalletType';
import { usePublicAccount } from './publicAccountContext';
import { useSubstrate } from './substrateContext';
import { useTxStatus } from './txStatusContext';

type txResHandlerType<T, E = undefined> = (
  result: T,
  extra: E
) => void | Promise<void>;

type MantaWalletContext = {
  isReady: boolean;
  signerIsConnected: boolean | null;
  hasFinishedInitialBlockDownload: boolean | null;
  privateAddress: string | null;
  getSpendableBalance: (asset: AssetType) => Promise<Balance | null>;
  toPrivate: (balance: Balance, txResHandler: any) => Promise<void>;
  toPublic: (balance: Balance, txResHandler: any) => Promise<void>;
  privateTransfer: (
    balance: Balance,
    receiveZkAddress: string,
    txResHandler: txResHandlerType<any>
  ) => Promise<void>;
  privateWallet: PrivateWallet | null;
  sync: () => Promise<void>;
  isInitialSync: MutableRefObject<boolean>;
};

const MantaWalletContext = createContext<MantaWalletContext | null>(null);

export const MantaWalletContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  // external contexts
  const { NETWORK_NAME: network } = useConfig();
  const { usingMantaWallet } = useGlobal();
  const { api } = useSubstrate();
  const { externalAccount } = usePublicAccount();
  const publicAddress = externalAccount?.address;
  const { setTxStatus } = useTxStatus();

  // private wallet
  const [privateWallet, setPrivateWallet] = useState<PrivateWallet | null>(
    null
  );
  const [isReady, setIsReady] = useState<boolean>(false);
  const signerIsConnected = !!privateWallet?.getZkBalance;

  const [privateAddress, setPrivateAddress] = useState<string | null>(null);
  const [hasFinishedInitialBlockDownload, setHasFinishedInitialBlockDownload] =
    useState<boolean | null>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const { mantaWalletInitialSync, setMantaWalletInitialSync } = useGlobal();

  // transaction state
  const txQueue = useRef<SubmittableExtrinsic<'promise', any>[]>([]);
  const finalTxResHandler = useRef<txResHandlerType<any> | null>(null);

  const getMantaWallet = useCallback(async () => {
    const substrateWallets = await getSubstrateWallets();
    const mantaWallet = substrateWallets.find(
      (wallet) => wallet.extension && wallet.extensionName === WALLET_NAME.MANTA
    );
    return mantaWallet;
  }, []);

  useEffect(() => {
    const getPrivateWallet = async () => {
      if (!privateWallet) {
        const mantaWallet = await getMantaWallet();
        if (mantaWallet?.extension?.privateWallet) {
          setPrivateWallet(mantaWallet?.extension?.privateWallet);
        }
      }
    };
    getPrivateWallet();
  });

  useEffect(() => {
    const getZkAddress = async () => {
      if (!privateAddress) {
        const mantaWallet = await getMantaWallet();
        if (!mantaWallet || !privateWallet) {
          return;
        }
        const accounts = await mantaWallet.getAccounts();
        if (!accounts || accounts.length <= 0) {
          return;
        }
        // @ts-ignore
        const { zkAddress } = accounts[0];
        setPrivateAddress(zkAddress);
      }
    };
    getZkAddress();
  }, [privateWallet, signerIsConnected, isReady, isBusy]);

  useEffect(() => {
    let unsub;
    if (privateWallet && usingMantaWallet) {
      unsub = privateWallet.subscribeWalletState((state) => {
        const { isWalletReady, isWalletBusy } = state;
        setIsReady(isWalletReady);
        setIsBusy(isWalletBusy);
      });
    }
    return unsub && unsub();
  }, [privateWallet, usingMantaWallet]);

  const getSpendableBalance = useCallback(
    async (assetType: AssetType) => {
      if (!privateWallet?.getZkBalance) {
        return null;
      }
      try {
        const balanceRaw = await privateWallet.getZkBalance({
          network,
          assetId: `${assetType.assetId}`
        });
        setHasFinishedInitialBlockDownload(true);
        return new Balance(assetType, new BN(balanceRaw || 0));
      } catch (error: any) {
        if (error.message === 'Need to sync the wallet first') {
          setHasFinishedInitialBlockDownload(false);
        }
        return null;
      }
    },
    [privateWallet, isReady, network]
  );

  const sync = useCallback(async () => {
    if (privateWallet && isReady) {
      try {
        const synced = await privateWallet.walletSync();
        if (synced) setMantaWalletInitialSync(false);
      } catch (error) {
        console.error('error syncing wallet', error);
      }
    }
  }, [privateWallet, isReady]);

  useEffect(() => {
    const initialSync = async () => {
      if (mantaWalletInitialSync) {
        await sync();
      }
    };
    initialSync();
  }, [isReady, mantaWalletInitialSync, privateWallet]);

  const handleInternalTxRes = async ({
    status,
    events
  }: {
    status: ExtrinsicStatus;
    events: EventRecord[];
  }) => {
    if (status.isInBlock) {
      for (const event of events) {
        if (api.events.utility.BatchInterrupted.is(event.event)) {
          setTxStatus(TxStatus.failed('Transaction failed'));
          txQueue.current = [];
          console.error('Internal transaction failed', event);
        }
      }
    } else if (status.isFinalized) {
      console.log('Internal transaction finalized');
      await publishNextBatch();
    }
  };

  const publishNextBatch = async () => {
    const sendExternal = async () => {
      try {
        const lastTx: any = txQueue.current.shift();
        if (!lastTx) {
          console.error(new Error('can not get lastTx'));
          setTxStatus(TxStatus.failed(''));
          return;
        }
        await lastTx.signAndSend(publicAddress, finalTxResHandler.current);
        setTxStatus(TxStatus.processing(null, lastTx.hash.toString()));
      } catch (e) {
        console.error('Error publishing private transaction batch', e);
        setTxStatus(TxStatus.failed('Transaction declined'));
        removePendingTxHistoryEvent();
        txQueue.current = [];
      }
    };

    const sendInternal = async () => {
      try {
        const internalTx: any = txQueue.current.shift();
        await internalTx.signAndSend(publicAddress, handleInternalTxRes);
      } catch (e) {
        setTxStatus(TxStatus.failed('internalTx failed'));
        txQueue.current = [];
      }
    };

    if (txQueue.current.length === 0) {
      return;
    } else if (txQueue.current.length === 1) {
      sendExternal();
    } else {
      sendInternal();
    }
  };

  const publishBatchesSequentially = async (
    batches: SubmittableExtrinsic<'promise', any>[],
    txResHandler: txResHandlerType<any>
  ) => {
    txQueue.current = batches;
    finalTxResHandler.current = txResHandler;
    try {
      publishNextBatch();
      return true;
    } catch (e) {
      console.error('Sequential baching failed', e);
      return false;
    }
  };

  const getBatches = async (signResult: string[]) => {
    const batches = [];
    for (let index = 0; index < signResult.length; index++) {
      const sign = signResult[index];
      const tx = api.tx(sign);
      batches.push(tx);
    }
    return batches;
  };

  const toPublic = useCallback(
    async (balance: Balance, txResHandler: txResHandlerType<any>) => {
      try {
        const signResult = await privateWallet?.toPublicBuild({
          assetId: `${balance.assetType.assetId}`,
          amount: balance.valueAtomicUnits.toString(),
          polkadotAddress: publicAddress,
          network
        });
        const batches = await getBatches(signResult as string[]);
        await publishBatchesSequentially(batches, txResHandler);
      } catch (e) {
        setTxStatus(TxStatus.failed('Transaction declined'));
      }
    },
    [privateWallet, publicAddress, network, api]
  );

  const privateTransfer = useCallback(
    async (
      balance: Balance,
      receiveZkAddress: string,
      txResHandler: txResHandlerType<any>
    ) => {
      try {
        const signResult = await privateWallet?.privateTransferBuild({
          assetId: `${balance.assetType.assetId}`,
          amount: balance.valueAtomicUnits.toString(),
          polkadotAddress: publicAddress,
          toZkAddress: receiveZkAddress,
          network
        });
        const batches = await getBatches(signResult as string[]);
        await publishBatchesSequentially(batches, txResHandler);
      } catch (e) {
        setTxStatus(TxStatus.failed('Transaction declined'));
      }
    },
    [privateWallet, publicAddress, network, api]
  );

  const toPrivate = useCallback(
    async (balance: Balance, txResHandler: txResHandlerType<any>) => {
      try {
        const signResult = await privateWallet?.toPrivateBuild({
          assetId: `${balance.assetType.assetId}`,
          amount: balance.valueAtomicUnits.toString(),
          polkadotAddress: publicAddress,
          network
        });
        const batches = await getBatches(signResult as string[]);
        await publishBatchesSequentially(batches, txResHandler);
      } catch (e) {
        setTxStatus(TxStatus.failed('Transaction declined'));
      }
    },
    [privateWallet, publicAddress, network, api]
  );

  const value = useMemo(
    () => ({
      isReady,
      hasFinishedInitialBlockDownload,
      privateAddress,
      getSpendableBalance,
      toPrivate,
      toPublic,
      privateTransfer,
      privateWallet,
      sync,
      isInitialSync: { current: false },
      signerIsConnected
    }),
    [
      isReady,
      hasFinishedInitialBlockDownload,
      privateAddress,
      externalAccount,
      api,
      getSpendableBalance,
      toPrivate,
      toPublic,
      privateTransfer,
      sync,
      privateWallet,
      signerIsConnected
    ]
  );

  return (
    <MantaWalletContext.Provider value={value}>
      {children}
    </MantaWalletContext.Provider>
  );
};

export const useMantaWallet = () => ({
  ...useContext(MantaWalletContext)
});
