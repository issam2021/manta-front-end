import WALLET_NAME from 'constants/WalletConstants';

// Given a wallet name as recognized by @talisman/connect-wallets library,
// returns the appropriate display name for the wallet.
const getWalletDisplayName = (name: string) => {
  if (name === WALLET_NAME.POLKADOT) {
    return 'polkadot.js';
  } else if (name === WALLET_NAME.TALISMAN) {
    return 'Talisman';
  } else if (name === WALLET_NAME.SUBWALLET) {
    return 'SubWallet';
  } else if (name === WALLET_NAME.MANTA) {
    return 'MantaWallet';
  } else {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
};

export default getWalletDisplayName;
