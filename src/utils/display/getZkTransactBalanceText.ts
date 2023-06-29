import Balance from 'types/Balance';

const getZkTransactBalanceText = (
  balance: Balance | null,
  apiIsDisconnected: boolean,
  isPrivate: boolean,
  isInitialSync: boolean,
  isMantaWallet: boolean
) => {
  if (apiIsDisconnected) {
    return 'Connecting to network';
  } else if (isInitialSync && isPrivate && !isMantaWallet) {
    return 'Syncing zk account';
  } else if (balance) {
    return `Balance: ${balance.toString()}`;
  } else {
    return '';
  }
};

export default getZkTransactBalanceText;
