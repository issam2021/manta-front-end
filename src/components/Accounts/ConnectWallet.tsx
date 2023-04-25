// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import { useModal } from 'hooks';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTxStatus } from 'contexts/txStatusContext';
import ConnectWalletModal from 'components/Modal/connectWalletModal';
import { useKeyring } from 'contexts/keyringContext';

export const ConnectWalletButton = ({
  setIsMetamaskSelected = null,
  text = 'Connect Wallet',
  className = ''
}) => {
  const component = (
    <button className={classNames(className)}>
      <p className="unselectable-text">{text}</p>
    </button>
  );

  return (
    <ConnectWallet
      component={component}
      setIsMetamaskSelected={setIsMetamaskSelected}
      className={className}
    />
  );
};

export const ConnectWalletIcon = ({ setIsMetamaskSelected = null }) => {
  const component = (
    <FontAwesomeIcon
      className={'w-6 h-6 px-5 py-4 cursor-pointer z-10 text-secondary'}
      icon={faPlusCircle}
    />
  );
  return (
    <ConnectWallet
      component={component}
      setIsMetamaskSelected={setIsMetamaskSelected}
    />
  );
};

const ConnectWallet = ({ component, setIsMetamaskSelected = null }) => {
  const { resetWalletConnectingErrorMessages } = useKeyring();
  const { ModalWrapper, showModal, hideModal } = useModal({
    closeCallback: () => resetWalletConnectingErrorMessages()
  });
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const onClick = () => !disabled && showModal();

  return (
    <>
      <div className={classNames({ disabled: disabled })} onClick={onClick}>
        {component}
      </div>
      <ModalWrapper>
        <ConnectWalletModal
          setIsMetamaskSelected={setIsMetamaskSelected}
          hideModal={hideModal}
        />
      </ModalWrapper>
    </>
  );
};
