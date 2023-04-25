// @ts-nocheck
import WALLET_NAME from 'constants/WalletConstants';
import React from 'react';
import Icon from 'components/Icon';
import { useKeyring } from 'contexts/keyringContext';
import { useMetamask } from 'contexts/metamaskContext';
import { getSubstrateWallets } from 'utils';
import getWalletDisplayName from 'utils/display/getWalletDisplayName';
import { useGlobal } from 'contexts/globalContexts';
import { useLocation } from 'react-router-dom';
import { ReactComponent as RecommendedImage } from 'resources/images/recommended-manta-wallet.svg';
import getErrMsgAfterRemovePathname from 'utils/display/getErrMsgAfterRemovePathname';

const ConnectWalletBlock = ({
  extensionName,
  walletName,
  isWalletInstalled,
  walletInstallLink,
  walletLogo,
  isWalletEnabled,
  connectHandler
}) => {
  const { walletConnectingErrorMessages } = useKeyring();
  const { usingMantaWallet } = useGlobal();
  const { pathname } = useLocation();
  const isCalamariMantaPayPage = pathname.includes('/calamari/transact');
  const usingNewUI = usingMantaWallet && isCalamariMantaPayPage;
  const errorMessage = walletConnectingErrorMessages[extensionName];

  const getDisplayedErrorMessage = () => {
    const talismanExtNotConfiguredString =
      'Talisman extension has not been configured yet. Please continue with onboarding.';
    if (
      extensionName === WALLET_NAME.TALISMAN &&
      errorMessage === talismanExtNotConfiguredString
    ) {
      return 'You have no account in Talisman. Please create one first.';
    }
    return getErrMsgAfterRemovePathname(errorMessage);
  };

  const WalletNameBlock = () => {
    const isMantaWallet = extensionName === WALLET_NAME.MANTA;
    return (
      <div>
        <div className="text-sm flex items-center gap-3 leading-5">
          {walletName}
          {isMantaWallet && usingNewUI && <RecommendedImage />}
        </div>
        {usingNewUI && (
          <div className="text-xs leading-4 mt-1 opacity-60">
            {isMantaWallet
              ? 'Public Address and zkAddress Combined'
              : 'Public Addresses Only'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative mt-6 p-4 flex items-center justify-between border border-white-light text-white rounded-lg w-full">
      <div className="flex flex-row items-center gap-4">
        {walletLogo && typeof walletLogo === 'object' ? (
          <img
            src={walletLogo.src}
            alt={walletLogo.alt}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <Icon name={walletLogo} className="w-6 h-6 rounded-full" />
        )}
        <WalletNameBlock />
      </div>

      {isWalletEnabled ? (
        <div className="flex items-center justify-center text-xs w-30">
          <div className="flex items-center gap-3">
            <div className="rounded full w-2 h-2 bg-green-300" />
            Connected
          </div>
        </div>
      ) : isWalletInstalled ? (
        <button
          onClick={connectHandler}
          className="rounded-lg bg-button-thirdry text-white text-sm w-30 h-10">
          Connect
        </button>
      ) : (
        <a href={walletInstallLink} target="_blank" rel="noreferrer">
          <div className="text-center rounded-lg bg-button-fourth text-white text-sm w-30 h-10 leading-10">
            Install
          </div>
        </a>
      )}

      {errorMessage && (
        <p className="absolute -left-px -bottom-5 flex flex-row gap-2 b-0 text-warning text-xsss">
          <Icon name="information" />
          {getDisplayedErrorMessage()}
        </p>
      )}
    </div>
  );
};

const MetamaskConnectWalletBlock = ({ hideModal }) => {
  const { configureMoonRiver, ethAddress } = useMetamask();
  const metamaskIsInstalled =
    window.ethereum?.isMetaMask &&
    !window.ethereum?.isBraveWallet &&
    !window.ethereum.isTalisman;

  const handleConnectWallet = async () => {
    const isConnected = await configureMoonRiver();
    isConnected && hideModal();
  };

  return (
    <ConnectWalletBlock
      key={'metamask'}
      walletName={'MetaMask (for Moonriver)'}
      isWalletInstalled={metamaskIsInstalled}
      walletInstallLink={'https://metamask.io/'}
      walletLogo="metamask"
      isWalletEnabled={!!ethAddress}
      connectHandler={handleConnectWallet}
    />
  );
};

export const SubstrateConnectWalletBlock = ({
  setIsMetamaskSelected,
  hideModal
}) => {
  const { connectWallet, connectWalletExtensions, authedWalletList } =
    useKeyring();
  const { usingMantaWallet } = useGlobal();

  let substrateWallets = getSubstrateWallets();

  if (!usingMantaWallet) {
    substrateWallets = substrateWallets.filter(
      (wallet) => wallet.extensionName !== WALLET_NAME.MANTA
    );
  } else {
    // display Manta Wallet as the first wallet
    const mantaWalletIndex = substrateWallets.findIndex(
      (wallet) => wallet.extensionName === WALLET_NAME.MANTA
    );
    substrateWallets.unshift(substrateWallets.splice(mantaWalletIndex, 1)[0]);
  }

  const handleConnectWallet = (walletName) => async () => {
    const isConnected = await connectWallet(walletName, true, true);
    if (isConnected) {
      connectWalletExtensions([...authedWalletList, walletName]);
      setIsMetamaskSelected && setIsMetamaskSelected(false);
      hideModal();
    }
  };

  return substrateWallets.map((wallet) => {
    // wallet.extension would not be defined if enabled not called
    // but for Talisman, when user reject, wallet.extension is still true
    // so we need another method to check the wallet connect status
    const isWalletEnabled = authedWalletList.includes(wallet.extensionName)
      ? true
      : false;
    return (
      <ConnectWalletBlock
        key={wallet.extensionName}
        extensionName={wallet.extensionName}
        walletName={getWalletDisplayName(wallet.extensionName)}
        isWalletInstalled={wallet.installed}
        walletInstallLink={wallet.installUrl}
        walletLogo={wallet.logo}
        isWalletEnabled={isWalletEnabled}
        connectHandler={handleConnectWallet(wallet.extensionName)}
      />
    );
  });
};

const ConnectWalletModal = ({ setIsMetamaskSelected, hideModal }) => {
  const isBridgePage = window?.location?.pathname?.includes('bridge');

  const { usingMantaWallet } = useGlobal();
  const { pathname } = useLocation();
  const isCalamariMantaPayPage = pathname.includes('/calamari/transact');
  const usingNewUI = usingMantaWallet && isCalamariMantaPayPage;

  return (
    <div className="w-126.5">
      <h1 className="text-xl text-white">Connect Wallet</h1>
      {usingNewUI && (
        <div className="mt-4 text-sm text-white opacity-60">
          For full MantaPay functionality,
          <br />
          both public and zkAddress are required.
        </div>
      )}
      <SubstrateConnectWalletBlock
        setIsMetamaskSelected={setIsMetamaskSelected}
        hideModal={hideModal}
      />
      {isBridgePage && <MetamaskConnectWalletBlock hideModal={hideModal} />}
      <p className="flex flex-row gap-2 mt-5 text-secondary text-xsss">
        <Icon name="information" />
        Already installed? Try refreshing this page
      </p>
    </div>
  );
};

export default ConnectWalletModal;
