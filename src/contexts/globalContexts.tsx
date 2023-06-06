// @ts-nocheck
import { localStorageKeys } from 'constants/LocalStorageConstants';
import PropTypes from 'prop-types';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import store from 'store';
import { KeyringContextProvider } from './keyringContext';

const GlobalContext = createContext();

const GlobalContextProvider = ({ children }) => {
  const initValue = store.get(localStorageKeys.UsingMantaWallet, true);
  const [usingMantaWallet, _setUsingMantaWallet] = useState(initValue);
  const [mantaWalletInitialSync, _setMantaWalletInitialSync] = useState(true);

  const setUsingMantaWallet = useCallback((state) => {
    _setUsingMantaWallet(state);
    store.set(localStorageKeys.UsingMantaWallet, state);
  }, []);

  const setMantaWalletInitialSync = useCallback((state) => {
    _setMantaWalletInitialSync(state);
  }, []);

  const contextValue = useMemo(
    () => ({
      usingMantaWallet,
      setUsingMantaWallet,
      mantaWalletInitialSync,
      setMantaWalletInitialSync
    }),
    [
      usingMantaWallet,
      setUsingMantaWallet,
      mantaWalletInitialSync,
      setMantaWalletInitialSync
    ]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      <KeyringContextProvider>{children}</KeyringContextProvider>
    </GlobalContext.Provider>
  );
};

GlobalContextProvider.propTypes = {
  children: PropTypes.any
};

export const useGlobal = () => ({
  ...useContext(GlobalContext)
});

export default GlobalContextProvider;
