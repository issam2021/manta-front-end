import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useMantaSignerWallet } from 'contexts/mantaSignerWalletContext';
import { useMantaWallet } from 'contexts/mantaWalletContext';
import Version from 'types/Version';
import { Balance } from '@polkadot/types/interfaces';
import { useGlobal } from './globalContexts';

type MantaWalletExclusiveProperties = {
  mantaWalletVersion: Version | null;
  hasFinishedInitialBlockDownload: boolean | null;
}

const dummyMantaWalletExclusiveProperties: MantaWalletExclusiveProperties = {
  mantaWalletVersion: null,
  hasFinishedInitialBlockDownload: null
};

type MantaSignerExclusiveProperties = {
  setBalancesAreStale: (_: boolean) => void;
  balancesAreStale: boolean;
  balancesAreStaleRef: React.MutableRefObject<boolean>;
  signerVersion: Version | null;
}

const dummyMantaSignerExclusiveProperties: MantaSignerExclusiveProperties = {
  setBalancesAreStale: () => {return;},
  balancesAreStale: false,
  balancesAreStaleRef: {current: false},
  signerVersion: null
};

type PrivateWalletContextValue = {
  signerVersion: Version | null;
  mantaWalletVersion: Version | null;
  isReady: boolean;
  privateAddress: string | null;
  getSpendableBalance: () => Promise<Balance | null>;
  toPrivate: (_: Balance, __: any) => Promise<void>;
  toPublic:  (_: Balance, __: any) => Promise<void>;
  privateTransfer:  (_: Balance, __: any) => Promise<void>;
  signerIsConnected: boolean | null,
  isInitialSync: React.MutableRefObject<boolean>,
  setBalancesAreStale: (_: boolean) => void,
  balancesAreStale: boolean,
  balancesAreStaleRef: React.MutableRefObject<boolean>
  hasFinishedInitialBlockDownload: boolean | null;
};

const PrivateWalletContext = createContext<PrivateWalletContextValue | null>(null);

export const PrivateWalletContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const { usingMantaWallet } = useGlobal();
  const mantaSignerValue = useMantaSignerWallet();
  const mantaWalletValue = useMantaWallet();

  const value = useMemo(
    () => {
      return usingMantaWallet ?
        {...dummyMantaSignerExclusiveProperties, ...mantaWalletValue}
        : {...dummyMantaWalletExclusiveProperties, ...mantaSignerValue};
    },
    [
      mantaSignerValue?.isReady,
      mantaSignerValue?.privateAddress,
      mantaSignerValue?.getSpendableBalance,
      mantaSignerValue?.toPrivate,
      mantaSignerValue?.toPublic,
      mantaSignerValue?.privateTransfer,
      mantaSignerValue?.signerIsConnected,
      mantaSignerValue?.signerVersion,
      mantaSignerValue?.isInitialSync,
      mantaSignerValue?.setBalancesAreStale,
      mantaSignerValue?.balancesAreStale,
      mantaSignerValue?.balancesAreStaleRef,
      mantaWalletValue?.isReady,
      mantaWalletValue?.hasFinishedInitialBlockDownload,
      mantaWalletValue?.privateAddress,
      mantaWalletValue?.getSpendableBalance,
      mantaWalletValue?.toPrivate,
      mantaWalletValue?.toPublic,
      mantaWalletValue?.privateTransfer,
      mantaWalletValue?.privateWallet,
      mantaWalletValue?.sync,
      mantaWalletValue?.isInitialSync,
      mantaWalletValue?.signerIsConnected,
    ]
  );

  return (
    <PrivateWalletContext.Provider value={value}>
      {children}
    </PrivateWalletContext.Provider>
  );
};

export const usePrivateWallet = () => {
  const data = useContext(PrivateWalletContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'usePrivateWallet can only be used inside of <PrivateWalletContext />, please declare it at a higher level.'
    );
  }
  return data;
};
