// @ts-nocheck
import store from 'store';

const HAS_AUTH_TO_CONNECT_METAMASK_KEY = 'hasAuthToConnectMetamask';
const AUTHED_WALLET_LIST = 'hasAuthToConnectWallet';

export const setHasAuthToConnectMetamaskStorage = (isAuthorized) => {
  store.set(HAS_AUTH_TO_CONNECT_METAMASK_KEY, isAuthorized);
};

export const getHasAuthToConnectMetamaskStorage = () => {
  return store.get(HAS_AUTH_TO_CONNECT_METAMASK_KEY, false);
};

export const setAuthedWalletListStorage = (walletNames) => {
  store.set(AUTHED_WALLET_LIST, walletNames);
};

export const getAuthedWalletListStorage = () => {
  return store.get(AUTHED_WALLET_LIST, []);
};
