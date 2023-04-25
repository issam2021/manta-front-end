// @ts-nocheck
import WALLET_NAME from 'constants/WalletConstants';
import React from 'react';
import classNames from 'classnames';
import Icon from 'components/Icon';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { useKeyring } from 'contexts/keyringContext';
import { useMetamask } from 'contexts/metamaskContext';
import { useTxStatus } from 'contexts/txStatusContext';
import { getSubstrateWallets } from 'utils';
import { setLastAccessedWallet } from 'utils/persistence/walletStorage';
import { useGlobal } from 'contexts/globalContexts';

const SubstrateWallets = ({ isMetamaskSelected, setIsMetamaskSelected }) => {
  const { changeExternalAccountOptions } = usePublicAccount();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const { usingMantaWallet } = useGlobal();
  const {
    refreshWalletAccounts,
    getLatestAccountAndPairs,
    selectedWallet,
    authedWalletList,
    keyringIsBusy
  } = useKeyring();
  const substrateWallets = getSubstrateWallets();
  let enabledExtentions = substrateWallets.filter((wallet) =>
    authedWalletList.includes(wallet.extensionName)
  );
  if (!usingMantaWallet) {
    enabledExtentions = enabledExtentions.filter(
      (wallet) =>
        wallet.extensionName !== WALLET_NAME.MANTA &&
        authedWalletList.includes(wallet.extensionName)
    );
  }
  const onClickWalletIconHandler = (wallet) => async () => {
    if (keyringIsBusy.current === false && !disabled) {
      await refreshWalletAccounts(wallet);
      const { account, pairs } = getLatestAccountAndPairs();
      changeExternalAccountOptions(account, pairs);
      setLastAccessedWallet(wallet);
      setIsMetamaskSelected(false);
    }
  };

  return enabledExtentions.map((wallet) => (
    <button
      className={classNames('px-5 py-5 rounded-t-lg', {
        'bg-primary':
          wallet.extensionName === selectedWallet.extensionName &&
          !isMetamaskSelected,
        disabled: disabled
      })}
      key={wallet.extensionName}
      onClick={onClickWalletIconHandler(wallet)}>
      <img
        className="w-6 h-6 max-w-6 max-h-6"
        src={wallet.logo.src}
        alt={wallet.logo.alt}
      />
    </button>
  ));
};

const MetamaskWallet = ({ isMetamaskSelected, setIsMetamaskSelected }) => {
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const onClickMetamaskHandler = () => {
    !disabled && setIsMetamaskSelected(true);
  };
  return (
    <button
      className={classNames('px-5 py-5', {
        'bg-primary': isMetamaskSelected,
        disabled: disabled
      })}
      onClick={onClickMetamaskHandler}>
      <Icon className="w-6 h-6 max-w-6 max-h-6" name="metamask" />
    </button>
  );
};

const WalletSelectIconBar = ({ isMetamaskSelected, setIsMetamaskSelected }) => {
  const { ethAddress } = useMetamask();
  const isBridgePage = window?.location?.pathname?.includes('bridge');
  return (
    <>
      <SubstrateWallets
        isMetamaskSelected={isMetamaskSelected}
        setIsMetamaskSelected={setIsMetamaskSelected}
      />
      {isBridgePage && ethAddress && (
        <MetamaskWallet
          isMetamaskSelected={isMetamaskSelected}
          setIsMetamaskSelected={setIsMetamaskSelected}
        />
      )}
    </>
  );
};

export default WalletSelectIconBar;
