// @ts-nocheck
import NETWORK from 'constants/NetworkConstants';
import DeveloperConsole from 'components/Developer/DeveloperConsole';
import { ConfigContextProvider, useConfig } from 'contexts/configContext';
import { PublicAccountContextProvider } from 'contexts/publicAccountContext';
import { MantaSignerWalletContextProvider } from 'contexts/mantaSignerWalletContext';
import { MantaWalletContextProvider } from 'contexts/mantaWalletContext';
import { MetamaskContextProvider } from 'contexts/metamaskContext';
import { SubstrateContextProvider } from 'contexts/substrateContext';
import { TxStatusContextProvider, useTxStatus } from 'contexts/txStatusContext';
import { UsdPricesContextProvider } from 'contexts/usdPricesContext';
import { ZkAccountBalancesContextProvider } from 'contexts/zkAccountBalancesContext';
import { PrivateWalletContextProvider } from 'contexts/privateWalletContext';
import MantaWalletIntroModal from 'components/Modal/MantaWalletIntroModal';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import initAxios from 'utils/api/initAxios';
import {
  showError,
  showInfo,
  showSuccess,
  showWarning
} from 'utils/ui/Notifications';
import { useGlobal } from 'contexts/globalContexts';

const TxStatusHandler = () => {
  const { txStatus, setTxStatus } = useTxStatus();

  useEffect(() => {
    if (txStatus?.isFinalized()) {
      showSuccess(txStatus.subscanUrl, txStatus?.extrinsic);
      setTxStatus(null);
    } else if (txStatus?.isFailed()) {
      showError(txStatus.message || 'Transaction failed');
      setTxStatus(null);
    } else if (txStatus?.isProcessing() && txStatus.message) {
      showInfo(txStatus.message);
    } else if (txStatus?.isDisconnected()) {
      showWarning('Network disconnected');
      setTxStatus(null);
    }
  }, [txStatus]);
  return null;
};

const BasePage = ({ children }) => {
  const config = useConfig();
  useEffect(() => {
    initAxios(config);
  }, []);
  return (
    <TxStatusContextProvider>
      <SubstrateContextProvider>
        <PublicAccountContextProvider>
          <DeveloperConsole />
          <TxStatusHandler />
          {children}
        </PublicAccountContextProvider>
      </SubstrateContextProvider>
    </TxStatusContextProvider>
  );
};

BasePage.propTypes = {
  children: PropTypes.any
};

const PrivateWalletImplementation = ({ children }) => {
  const { usingMantaWallet } = useGlobal();
  if (usingMantaWallet) {
    return <MantaWalletContextProvider>{children}</MantaWalletContextProvider>;
  }
  return (
    <MantaSignerWalletContextProvider>
      {children}
    </MantaSignerWalletContextProvider>
  );
};

PrivateWalletImplementation.propTypes = {
  children: PropTypes.any
};

export const CalamariBasePage = ({ children }) => {
  return (
    <ConfigContextProvider network={NETWORK.CALAMARI}>
      <MantaWalletIntroModal />
      <BasePage>
        <UsdPricesContextProvider>
          <MetamaskContextProvider>
            <PrivateWalletImplementation>
              <PrivateWalletContextProvider>
                <ZkAccountBalancesContextProvider>
                  {children}
                </ZkAccountBalancesContextProvider>
              </PrivateWalletContextProvider>
            </PrivateWalletImplementation>
          </MetamaskContextProvider>
        </UsdPricesContextProvider>
      </BasePage>
    </ConfigContextProvider>
  );
};

CalamariBasePage.propTypes = {
  children: PropTypes.any
};

export const DolphinBasePage = ({ children }) => {
  return (
    <ConfigContextProvider network={NETWORK.DOLPHIN}>
      <BasePage>
        <UsdPricesContextProvider>
          <MetamaskContextProvider>
            <PrivateWalletImplementation>
              <PrivateWalletContextProvider>
                <ZkAccountBalancesContextProvider>
                  {children}
                </ZkAccountBalancesContextProvider>
              </PrivateWalletContextProvider>
            </PrivateWalletImplementation>
          </MetamaskContextProvider>
        </UsdPricesContextProvider>
      </BasePage>
    </ConfigContextProvider>
  );
};

DolphinBasePage.propTypes = {
  children: PropTypes.any
};
