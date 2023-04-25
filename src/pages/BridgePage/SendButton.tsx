// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import { useTxStatus } from 'contexts/txStatusContext';
import MantaLoading from 'components/Loading';
import { ConnectWalletButton } from 'components/Accounts/ConnectWallet';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { useMetamask } from 'contexts/metamaskContext';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import Chain from 'types/Chain';
import { useConfig } from 'contexts/configContext';
import { useBridgeTx } from './BridgeContext/BridgeTxContext';
import { useBridgeData } from './BridgeContext/BridgeDataContext';

const ValidationButton = () => {
  const config = useConfig();
  const { apiState } = useSubstrate();
  const { externalAccount } = usePublicAccount();
  const {
    senderAssetType,
    minInput,
    originChain,
    originChainIsEvm,
    destinationChainIsEvm,
    destinationAddress,
    senderAssetTargetBalance
  } = useBridgeData();
  const { txIsOverMinAmount, userHasSufficientFunds, userCanPayOriginFee } =
    useBridgeTx();
  const { ethAddress, chainId } = useMetamask();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const apiIsDisconnected = apiState === API_STATE.ERROR || apiState === API_STATE.DISCONNECTED;

  const evmIsEnabled = originChainIsEvm || destinationChainIsEvm;

  let validationMsg = null;
  let isConnectWallet = false;
  let isSwitchNetwork = false;
  let connectWalletText = 'Connect Wallet';

  if (!externalAccount) {
    isConnectWallet = true;
  } else if (!ethAddress && originChainIsEvm) {
    isConnectWallet = true;
    connectWalletText = 'Connect MetaMask';
  } else if (apiIsDisconnected) {
    validationMsg = 'Connecting to network';
  } else if (evmIsEnabled && originChainIsEvm && chainId !== Chain.Moonriver(config).ethChainId) {
    isSwitchNetwork = true;
  } else if (!senderAssetTargetBalance) {
    validationMsg = 'Enter amount';
  } else if (userHasSufficientFunds() === false) {
    validationMsg = 'Insuffient balance';
  } else if (evmIsEnabled && !destinationAddress) {
    validationMsg = `Enter ${originChainIsEvm ? 'substrate' : 'EVM'} address`;
  } else if (userCanPayOriginFee() === false) {
    validationMsg = `Insufficient ${originChain.nativeAsset.ticker} to pay origin fee`;
  } else if (txIsOverMinAmount() === false) {
    const MIN_INPUT_DIGITS = 6;
    validationMsg = `Minimum ${
      senderAssetType.ticker
    } transaction is ${minInput.toDisplayString(MIN_INPUT_DIGITS)}`;
  }

  const ValidationText = ({ validationMsg }) => {
    return (
      <div
        className={classNames(
          'bg-connect-wallet-button py-2 unselectable-text text-center text-white',
          'rounded-lg w-full filter brightness-50 cursor-not-allowed'
        )}>
        {validationMsg}
      </div>
    );
  };

  const shouldShowSendButton =
    !disabled && !isConnectWallet && !validationMsg && !isSwitchNetwork;
  const shouldShowConnectWallet = !disabled && isConnectWallet;
  const shouldShowValidation = !disabled && !isConnectWallet && validationMsg;
  const shouldShowSwitchNetwork = !disabled && !isConnectWallet && !validationMsg && isSwitchNetwork;

  return (
    <>
      {disabled && <MantaLoading className="py-3" />}
      {shouldShowSendButton && <SendButton />}
      {shouldShowConnectWallet && (
        <ConnectWalletButton
          text={connectWalletText}
          className={classNames(
            'bg-connect-wallet-button py-2 unselectable-text cursor-pointer',
            'text-center text-white rounded-lg w-full'
          )}
        />
      )}
      {shouldShowValidation && <ValidationText validationMsg={validationMsg} />}
      {shouldShowSwitchNetwork && <SwitchNetworkButton/>}
    </>
  );
};

const SwitchNetworkButton = () => {
  const { configureMoonRiver } = useMetamask();

  const onClick = () => {
    configureMoonRiver();
  };

  return (
    <button
      onClick={onClick}
      className={classNames(
        'bg-connect-wallet-button py-2 unselectable-text cursor-pointer',
        'text-center text-white rounded-lg w-full'
      )}>
      Switch Network to Moonriver
    </button>
  );
};

const SendButton = () => {
  const { send } = useBridgeTx();

  const onClick = () => {
    send();
  };

  return (
    <button
      onClick={onClick}
      className={classNames(
        'bg-connect-wallet-button py-2 unselectable-text cursor-pointer',
        'text-center text-white rounded-lg w-full'
      )}>
      Submit
    </button>
  );
};

export default ValidationButton;
