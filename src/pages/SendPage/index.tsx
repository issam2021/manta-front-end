import React from 'react';
import IPBlockingModal from 'components/Modal/IPBlockingModal';
import Navbar from 'components/Navbar';
import PageContent from 'components/PageContent';
import { useConfig } from 'contexts/configContext';
import { Notification } from 'element-react';
import { useEffect } from 'react';
import versionIsOutOfDate from 'utils/validation/versionIsOutOfDate';
import { WarningNotification } from 'components/NotificationContent';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { SendContextProvider } from './SendContext';
import SendForm from './SendForm';
import { PrivateTxHistoryContextProvider } from './privateTxHistoryContext';

const SendPage = () => {
  const config = useConfig();
  const { mantaWalletVersion } = usePrivateWallet();
  const outdated = versionIsOutOfDate(
    config.MIN_REQUIRED_WALLET_VERSION,
    mantaWalletVersion
  );

  useEffect(() => {
    if (outdated) {
      // use setTimeout to fix two Notifications overlap issue
      setTimeout(() => {
        const updateVersionWarningInfo = {
          title: 'Please Update Manta Wallet',
          content:
            'To use Manta Wallet on MantaPay, please update Manta Wallet to the latest Version.',
          linkUrl: 'https://docs.manta.network/docs/guides/MantaWalletUpdate',
          linkText: 'Learn how to update'
        };
        Notification({
          message: <WarningNotification {...updateVersionWarningInfo} />,
          duration: 15000,
          offset: 70
        });
      }, 0);
    }
  }, [outdated]);

  return (
    <SendContextProvider>
      <PrivateTxHistoryContextProvider>
        <Navbar />
        <PageContent>
          <SendForm />
        </PageContent>
        <IPBlockingModal />
      </PrivateTxHistoryContextProvider>
    </SendContextProvider>
  );
};

export default SendPage;
