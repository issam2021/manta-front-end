// @ts-nocheck
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTxStatus } from 'contexts/txStatusContext';
import { ethers } from 'ethers';
import { useMetamask } from 'contexts/metamaskContext';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { validatePublicAddress } from 'utils/validation/validateAddress';
import { useKeyring } from 'contexts/keyringContext';
import Icon from 'components/Icon';
import { ConnectWalletButton } from 'components/Accounts/ConnectWallet';
import { useBridgeData } from './BridgeContext/BridgeDataContext';

const BirdgeDestinationButton = ({onChangeDestinationtInput}) => {
  const {
    destinationAddress,
    destinationChainIsEvm,
    originChainIsEvm
  } = useBridgeData();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const { selectedWallet } = useKeyring();
  const { ethAddress, configureMoonRiver } = useMetamask();
  const { externalAccount } = usePublicAccount();

  const onClick = () => {
    if (!ethAddress && destinationChainIsEvm) {
      configureMoonRiver();
    } else if (!externalAccount && originChainIsEvm) {
      return;
    } else {
      handleClickGetAddress();
    }
  };

  const handleClickGetAddress = () => {
    if (disabled) {
      return;
    } else if (destinationChainIsEvm) {
      onChangeDestinationtInput(ethAddress);
    } else {
      onChangeDestinationtInput(externalAccount?.address);
    }
  };

  const getAddressIcon = () => {
    if (destinationChainIsEvm) {
      return <Icon name="metamask" className="w-6 h-6" />;
    } else {
      return (
        <img
          className="w-6 h-6"
          src={selectedWallet.logo.src}
          alt={selectedWallet.logo.alt}
        />
      );
    }
  };

  const getAccountName = () => {
    if (destinationChainIsEvm) {
      return 'MetaMask';
    } else {
      return externalAccount?.meta.name;
    }
  };

  const SelectedAccountText = () => {
    return (
      <>
        <div className="block w-5 mr-1 min-w-full min-h-full">
          <i>{getAddressIcon()}</i>
        </div>
        <p className="block min-w-0 w-20 inline-block pt-0.5  overflow-hidden overflow-ellipsis">
          {getAccountName()}
        </p>
      </>
    );
  };

  if (!externalAccount && originChainIsEvm) {
    return <ConnectWalletButton className={classNames(
      'w-32 ml-1 h-16 rounded-lg text-black',
      'dark:text-white outline-none rounded-2xl border-2 border-solid border-white border-opacity-20',
      'text-xs text-black dark:text-white',
      { disabled: disabled }
    )}
    />;
  }

  const ButtonContents = () => {
    const destinationAccountIsMine = destinationAddress &&
    (destinationAddress === externalAccount?.address || destinationAddress === ethAddress);
    if (destinationAccountIsMine) {
      return <SelectedAccountText />;
    } else if (!ethAddress && destinationChainIsEvm) {
      return <p className="text-xss">Connect MetaMask</p>;
    } else {
      return <p>Get Address</p>;
    }
  };

  return (
    <button
      onClick={onClick}
      className={classNames(
        'w-32 ml-1 h-full rounded-lg text-black',
        'dark:text-white outline-none rounded-2xl border-2 border-solid border-white border-opacity-20',
        'text-xs text-black dark:text-white',
        { disabled: disabled }
      )}>
      <span className="w-32 px-1 flex justify-center whitespace-nowrap overflow-hidden">
        <ButtonContents />
      </span>
    </button>
  );
};

const BridgeDestinationForm = () => {
  const {
    setDestinationAddress,
    destinationChain,
    originChain,
    destinationChainIsEvm,
    originChainIsEvm
  } = useBridgeData();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const [inputValue, setInputValue] = useState('');

  // Clear input if origin and destination chain are swapped
  useEffect(() => {
    setInputValue('');
  }, [originChain, destinationChain]);

  const validateAddress = (maybeAddress) => {
    if (destinationChainIsEvm) {
      return ethers.utils.isAddress(maybeAddress);
    }
    return validatePublicAddress(maybeAddress);
  };

  const onChangeDestinationtInput = (value) => {
    if (value === '') {
      setInputValue('');
      setDestinationAddress(null);
    } else if (validateAddress(value)) {
      setInputValue(value);
      setDestinationAddress(value);
    } else {
      setInputValue(value);
      setDestinationAddress(null);
    }
  };

  const placeholderMsg = `Enter ${originChainIsEvm ? 'substrate' : 'EVM'} address`;

  return (
    <div className="flex items-center flex-grow h-16 mt-6">
      <input
        id="recipientAddress"
        autoComplete="off"
        className={classNames(
          'w-full h-full rounded-lg manta-bg-gray px-5',
          'text-sm text-black dark:text-white outline-none rounded-lg',
          { disabled: disabled }
        )}
        onChange={(e) => onChangeDestinationtInput(e.target.value)}
        value={inputValue}
        disabled={disabled}
        placeholder={placeholderMsg}
      />
      <BirdgeDestinationButton
        onChangeDestinationtInput={onChangeDestinationtInput}
      />
    </div>
  );
};

export default BridgeDestinationForm;
