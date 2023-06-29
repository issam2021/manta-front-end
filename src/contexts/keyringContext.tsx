import APP_NAME from 'constants/AppConstants';
import { SS58 } from 'constants/NetworkConstants';
import WALLET_NAME from 'constants/WalletConstants';
import { KeyringPair } from '@polkadot/keyring/types';
import keyring, { Keyring } from '@polkadot/ui-keyring';
import { Wallet } from 'manta-extension-connect';
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { getSubstrateWallets } from 'utils';
import {
  getAuthedWalletListStorage,
  setAuthedWalletListStorage
} from 'utils/persistence/connectAuthorizationStorage';
import { getLastAccessedExternalAccount } from 'utils/persistence/externalAccountStorage';
import {
  getLastAccessedWallet,
  setLastAccessedWallet
} from 'utils/persistence/walletStorage';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import isObjectEmpty from 'utils/validation/isEmpty';
import { useActive } from 'hooks/useActive';

type KeyringContextValue = {
  keyring: Keyring;
  isKeyringInit: boolean;
  keyringAddresses: string[];
  selectedWallet: Wallet;
  keyringIsBusy: MutableRefObject<boolean>;
  authedWalletList: string[];
  walletConnectingErrorMessages: { [key: string]: string };
  connectWallet: (
    extensionName: string,
    saveToStorage?: boolean,
    isFromConnectModal?: boolean
  ) => Promise<boolean | undefined>;
  connectWalletExtensions: (extensionNames: string[]) => void;
  refreshWalletAccounts: (
    wallet: Wallet
  ) => Promise<string | undefined> | undefined;
  getLatestAccountAndPairs: () => {
    account: KeyringPair;
    pairs: KeyringPair[];
  };
  resetWalletConnectingErrorMessages: () => void;
};
const KeyringContext = createContext<KeyringContextValue | null>(null);

const getInitialWalletConnectingErrorMessages = () => {
  const errorMessages: { [key: string]: string } = {};
  Object.values(WALLET_NAME).forEach(
    (walletName: string) => (errorMessages[walletName] = '')
  );
  return errorMessages;
};

export const KeyringContextProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [isKeyringInit, setIsKeyringInit] = useState(false);
  const [keyringAddresses, setKeyringAddresses] = useState<string[]>([]);
  const [web3ExtensionInjected, setWeb3ExtensionInjected] = useState<string[]>(
    []
  );
  const [selectedWallet, setSelectedWallet] = useState<Wallet>(
    getLastAccessedWallet()
  );
  const lastAccessExtensionName = getLastAccessedWallet()?.extensionName;
  const [authedWalletList, setAuthedWalletList] = useState<string[]>([]);
  const keyringIsBusy = useRef(false);

  const [walletConnectingErrorMessages, setWalletConnectingErrorMessages] =
    useState(getInitialWalletConnectingErrorMessages());

  const resetWalletConnectingErrorMessages = useCallback(() => {
    setWalletConnectingErrorMessages(getInitialWalletConnectingErrorMessages());
  }, []);

  const isActive = useActive();

  const addWalletName = (walletName: string, walletNameList: string[]) => {
    const copyWalletNameList = [...walletNameList];
    if (!copyWalletNameList.includes(walletName)) {
      copyWalletNameList.push(walletName);
      return copyWalletNameList;
    }
    return copyWalletNameList;
  };

  const refreshWalletAccounts = async (wallet: Wallet) => {
    if (!wallet?.enable) {
      return Promise.resolve('no enable function');
    }
    keyringIsBusy.current = true;
    let currentKeyringAddresses = keyring
      .getAccounts()
      .map((account) => account.address);

    const originUpdatedAccounts = await wallet.getAccounts();
    const updatedAccounts = originUpdatedAccounts.filter((a) => {
      // @ts-ignore
      return ['ecdsa', 'ed25519', 'sr25519'].includes(a.type);
    }); // ethereum account address should be avoid in substrate (tailsman)
    const substrateAddresses: string[] = updatedAccounts.map(
      (account) => account.address
    );
    currentKeyringAddresses.forEach((address) => {
      keyring.forgetAccount(address);
    });
    // keyring has the possibility to still contain accounts
    currentKeyringAddresses = keyring
      .getAccounts()
      .map((account) => account.address);

    if (currentKeyringAddresses.length === 0) {
      updatedAccounts.forEach((account) => {
        // loadInjected is a privated function, will caused eslint error
        // @ts-ignore
        keyring.loadInjected(account.address, { ...account }, account.type);
      });

      // to prevent re-render when keyringAddresses not change because re-render will cause other bugs
      const sameLength = keyringAddresses.length === substrateAddresses.length;
      const keyringAddressesNotChanged =
        sameLength &&
        keyringAddresses.filter((addr) => !substrateAddresses.includes(addr))
          .length === 0;
      setSelectedWallet(wallet);
      if (!keyringAddressesNotChanged) {
        setKeyringAddresses(substrateAddresses);
      }
    }

    keyringIsBusy.current = false;
  };

  const connectWallet = useCallback(
    async (
      extensionName: string,
      saveToStorage = true,
      isFromConnectModal = false
    ) => {
      if (!isKeyringInit) {
        setWalletConnectingErrorMessages({
          ...walletConnectingErrorMessages,
          ...{ [extensionName]: 'not init keyring yet' }
        });
        return false;
      }
      if (walletConnectingErrorMessages[extensionName]) {
        setWalletConnectingErrorMessages({
          ...walletConnectingErrorMessages,
          ...{ [extensionName]: '' }
        });
      }
      const substrateWallets = getSubstrateWallets();
      const selectedWallet = substrateWallets.find(
        (wallet: any) => wallet.extensionName === extensionName
      );
      if (
        !selectedWallet?.extension ||
        (extensionName === WALLET_NAME.TALISMAN &&
          !authedWalletList.includes(extensionName))
      ) {
        try {
          await selectedWallet?.enable(APP_NAME);
          if (
            isFromConnectModal &&
            extensionName === WALLET_NAME.MANTA &&
            authedWalletList.length > 0
          ) {
            return true;
          }
          if (selectedWallet) {
            await refreshWalletAccounts(selectedWallet);
          }
          saveToStorage &&
            selectedWallet &&
            setLastAccessedWallet(selectedWallet);
          return true;
        } catch (e: any) {
          setWalletConnectingErrorMessages({
            ...walletConnectingErrorMessages,
            ...{ [extensionName]: e.message }
          });
          // catch both errors for selectedWallet?.enable and refreshWalletAccounts:wallet.getAccounts(e.g. Talisman reject)
          // if for refreshWalletAccounts:wallet.getAccounts, we need to change keyringIsBusy.current = false
          if (keyringIsBusy.current) {
            keyringIsBusy.current = false;
          }
          return false;
        }
      }
      return true;
    },
    [
      isKeyringInit,
      walletConnectingErrorMessages,
      authedWalletList,
      refreshWalletAccounts
    ]
  );

  const connectWalletExtensions = useCallback(
    async (extensionNames: string[]) => {
      let walletNames = [...authedWalletList];
      for (const extensionName of extensionNames.filter(
        (name) => name !== lastAccessExtensionName
      )) {
        const isConnectedSuccess = await connectWallet(extensionName, false);
        if (isConnectedSuccess) {
          walletNames = addWalletName(extensionName, walletNames);
        }
      }
      if (lastAccessExtensionName) {
        const isConnectedSuccess = await connectWallet(
          lastAccessExtensionName,
          true
        );
        if (isConnectedSuccess) {
          walletNames = addWalletName(lastAccessExtensionName, walletNames);
        }
      }
      setAuthedWalletListStorage(walletNames);
      setAuthedWalletList(walletNames);
    },
    [authedWalletList, lastAccessExtensionName, connectWallet]
  );

  const getLatestAccountAndPairs = () => {
    const pairs = keyring.getPairs();
    const {
      meta: { source }
    } = pairs[0] || { meta: {} };
    const account =
      getLastAccessedExternalAccount(keyring, source as string) || pairs[0];
    return { account, pairs };
  };

  useEffect(() => {
    // if not adding keyringAddresses as a dep, interval refreshWalletAccounts() is always using old keyringAddresses value
    const hasSelectedWallet = !isObjectEmpty(selectedWallet);
    const interval = setInterval(async () => {
      isActive && hasSelectedWallet && refreshWalletAccounts(selectedWallet);
    }, 1000);
    return () => {
      interval && clearInterval(interval);
    };
  }, [selectedWallet, keyringAddresses]);

  const initKeyring = useCallback(async () => {
    if (!isKeyringInit && web3ExtensionInjected.length !== 0) {
      try {
        await cryptoWaitReady();
        const isCalamari = window?.location?.pathname?.includes('calamari');
        keyring.loadAll(
          {
            ss58Format: isCalamari ? SS58.CALAMARI : SS58.DOLPHIN
          },
          []
        );
        setIsKeyringInit(true);
      } catch (e: any) {
        console.error('initKeyring', e.message);
      }
    }
  }, [isKeyringInit, web3ExtensionInjected.length]);

  const getWeb3ExtensionInjected = useCallback(async () => {
    if (!isKeyringInit) {
      if (
        (window as any).injectedWeb3 &&
        Object.getOwnPropertyNames((window as any).injectedWeb3).length !== 0
      ) {
        setWeb3ExtensionInjected(
          Object.getOwnPropertyNames((window as any).injectedWeb3)
        );
      }
    }
  }, [isKeyringInit]);

  useEffect(() => {
    getWeb3ExtensionInjected();
  }, [getWeb3ExtensionInjected]);

  useEffect(() => {
    initKeyring();
  }, [initKeyring]);

  /** Keyring Init Logic */
  useEffect(() => {
    if (!isKeyringInit) {
      return;
    }
    const prevAuthedWalletList = getAuthedWalletListStorage();
    if (prevAuthedWalletList.length !== 0) {
      connectWalletExtensions(prevAuthedWalletList);
    }
  }, [isKeyringInit]);

  const value = useMemo(
    () => ({
      keyring, // keyring object would not change even if properties changed
      isKeyringInit,
      keyringAddresses, //keyring object would not change so use keyringAddresses to trigger re-render
      selectedWallet,
      keyringIsBusy,
      authedWalletList,
      walletConnectingErrorMessages,
      connectWallet,
      connectWalletExtensions,
      refreshWalletAccounts,
      getLatestAccountAndPairs,
      resetWalletConnectingErrorMessages
    }),
    [
      connectWallet,
      connectWalletExtensions,
      isKeyringInit,
      keyringAddresses,
      selectedWallet,
      authedWalletList,
      walletConnectingErrorMessages
    ]
  );

  return (
    <KeyringContext.Provider value={value}>{children}</KeyringContext.Provider>
  );
};

export const useKeyring = () => {
  const data = useContext(KeyringContext);
  if (!data || !Object.keys(data)?.length) {
    throw new Error(
      'useKeyring can only be used inside of <KeyringContext />, please declare it at a higher level.'
    );
  }
  return data;
};
