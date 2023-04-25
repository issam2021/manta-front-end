// @ts-nocheck
import WALLET_NAME from 'constants/WalletConstants';
import classNames from 'classnames';
import { ConnectWalletButton } from 'components/Accounts/ConnectWallet';
import MantaLoading from 'components/Loading';
import { ZkAccountConnect } from 'components/Navbar/ZkAccountButton';
import { useConfig } from 'contexts/configContext';
import { useGlobal } from 'contexts/globalContexts';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import { useTxStatus } from 'contexts/txStatusContext';
import Balance from 'types/Balance';
import versionIsOutOfDate from 'utils/validation/versionIsOutOfDate';
import { useSend } from './SendContext';
import useReceiverBalanceText from './SendToForm/useReceiverBalanceText';
import useSenderBalanceText from './SendToForm/useSenderBalanceText';

const InnerSendButton = ({ senderLoading, receiverLoading }) => {
  const { send, isToPrivate, isToPublic, isPublicTransfer, isPrivateTransfer } =
    useSend();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing() || senderLoading || receiverLoading;

  let buttonLabel;
  if (isToPrivate()) {
    buttonLabel = 'To Private';
  } else if (isToPublic()) {
    buttonLabel = 'To Public';
  } else if (isPublicTransfer()) {
    buttonLabel = 'Public Transfer';
  } else if (isPrivateTransfer()) {
    buttonLabel = 'Private Transfer';
  }
  const onClickHandler = () => {
    if (!disabled) {
      send();
    }
  };

  return !disabled ? (
    <button
      id="sendButton"
      onClick={onClickHandler}
      className={classNames(
        'py-2 cursor-pointer unselectable-text',
        'text-center text-white rounded-lg gradient-button w-full',
        { disabled: disabled }
      )}>
      {buttonLabel}
    </button>
  ) : (
    <div
      className={classNames(
        'py-2 unselectable-text text-center text-white rounded-lg w-full gradient-button filter brightness-50'
      )}>
      {buttonLabel}
    </div>
  );
};

const ValidationSendButton = ({ showModal }) => {
  const config = useConfig();
  const { apiState } = useSubstrate();
  const {
    isPublicTransfer,
    isPrivateTransfer,
    receiverAddress,
    userCanPayFee,
    userHasSufficientFunds,
    receiverAssetType,
    receiverAmountIsOverExistentialBalance,
    senderAssetTargetBalance,
    senderNativeTokenPublicBalance
  } = useSend();
  const { usingMantaWallet } = useGlobal();
  const {
    signerIsConnected,
    signerVersion,
    privateWallet,
    hasFinishedInitialBlockDownload
  } = usePrivateWallet();
  const { externalAccount, extensionVersion, extensionName } = usePublicAccount();
  const apiIsDisconnected =
    apiState === API_STATE.ERROR || apiState === API_STATE.DISCONNECTED;
  const { shouldShowLoader: receiverLoading } = useReceiverBalanceText();
  const { shouldShowLoader: senderLoading } = useSenderBalanceText();

  let validationMsg = null;
  let shouldShowMantaWalletMissingValidation = false;
  let shouldShowWalletMissingValidation = false;
  let shouldShowSignerMissingValidation = false;
  let shouldShowWalletSignerMissingValidation = false;

  if (
    !signerIsConnected &&
    !isPublicTransfer() &&
    !externalAccount &&
    !usingMantaWallet
  ) {
    shouldShowWalletSignerMissingValidation = true;
  } else if (!signerIsConnected && !isPublicTransfer() && !usingMantaWallet) {
    shouldShowSignerMissingValidation = true;
  } else if (
    !usingMantaWallet &&
    versionIsOutOfDate(config.MIN_REQUIRED_SIGNER_VERSION, signerVersion)
  ) {
    validationMsg = 'Signer out of date';
  } else if (
    usingMantaWallet &&
    extensionName === WALLET_NAME.MANTA &&
    versionIsOutOfDate(config.MIN_REQUIRED_WALLET_VERSION, extensionVersion)
  ) {
    validationMsg = 'Manta Wallet out of date';
  } else if (!externalAccount) {
    shouldShowWalletMissingValidation = true;
  } else if (usingMantaWallet && !privateWallet && !isPublicTransfer()) {
    shouldShowMantaWalletMissingValidation = true;
  } else if (
    usingMantaWallet &&
    hasFinishedInitialBlockDownload === false &&
    !isPublicTransfer()
  ) {
    validationMsg = 'Manta Wallet sync required';
  } else if (apiIsDisconnected) {
    validationMsg = 'Connecting to network';
  } else if (!senderAssetTargetBalance) {
    validationMsg = 'Enter amount';
  } else if (userCanPayFee() === false) {
    validationMsg = `Insufficient ${senderNativeTokenPublicBalance?.assetType?.baseTicker} to pay transaction fee`;
  } else if (userHasSufficientFunds() === false) {
    validationMsg = 'Insufficient balance';
  } else if (
    receiverAddress === null &&
    (isPrivateTransfer() || isPublicTransfer())
  ) {
    validationMsg = `Enter recipient ${
      isPrivateTransfer() ? 'zkAddress' : 'substrate address'
    }`;
  } else if (
    receiverAddress === false &&
    (isPrivateTransfer() || isPublicTransfer())
  ) {
    validationMsg = `Invalid ${
      isPrivateTransfer() ? 'zkAddress' : 'substrate address'
    }`;
  } else if (receiverAmountIsOverExistentialBalance() === false) {
    const existentialDeposit = new Balance(
      receiverAssetType,
      receiverAssetType.existentialDeposit
    );
    validationMsg = `Min transaction is ${existentialDeposit.toDisplayString(
      3,
      false
    )}`;
  }

  const ValidationText = ({ validationMsg }) => {
    return (
      <div
        className={classNames(
          'py-2 unselectable-text text-center text-white rounded-lg w-full gradient-button filter brightness-50'
        )}>
        {validationMsg}
      </div>
    );
  };

  return (
    <>
      {shouldShowSignerMissingValidation && (
        <ZkAccountConnect
          className={
            'bg-connect-signer-button py-2 unselectable-text text-center text-white rounded-lg w-full'
          }
        />
      )}
      {shouldShowMantaWalletMissingValidation && (
        <ConnectWalletButton
          className={
            'bg-connect-wallet-button py-2 unselectable-text text-center text-white rounded-lg w-full'
          }
          text="Connect Manta Wallet"
        />
      )}
      {shouldShowWalletMissingValidation && (
        <ConnectWalletButton
          className={
            'bg-connect-wallet-button py-2 unselectable-text text-center text-white rounded-lg w-full'
          }
        />
      )}
      {shouldShowWalletSignerMissingValidation && (
        <>
          <button
            onClick={() => showModal()}
            className={classNames(
              'gradient-button py-2 unselectable-text text-center text-white rounded-lg w-full'
            )}>
            Connect Wallet and Signer
          </button>
        </>
      )}
      {validationMsg && <ValidationText validationMsg={validationMsg} />}
      {!shouldShowSignerMissingValidation &&
        !shouldShowWalletMissingValidation &&
        !shouldShowMantaWalletMissingValidation &&
        !shouldShowWalletSignerMissingValidation &&
        !validationMsg && (
        <InnerSendButton
          senderLoading={senderLoading}
          receiverLoading={receiverLoading}
        />
      )}
    </>
  );
};

const SendButton = ({ showModal }) => {
  const { txStatus } = useTxStatus();

  if (txStatus?.isProcessing()) {
    return <MantaLoading className="ml-6 py-4 place-self-center" />;
  } else {
    return <ValidationSendButton showModal={showModal} />;
  }
};

export default SendButton;
