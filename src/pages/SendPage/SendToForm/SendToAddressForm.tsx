// @ts-nocheck
import React from 'react';
import { useSend } from '../SendContext';
import SendToAddressInput from './SendToAddressInput';
import ReceiverBalanceDisplay from './ReceiverBalanceDisplay';

const SendToAddressForm = () => {
  const { isPrivateTransfer, isPublicTransfer } = useSend();
  const shouldShowAddressInput = isPrivateTransfer() || isPublicTransfer();

  return (
    <>
      {
        shouldShowAddressInput ? <SendToAddressInput /> : <ReceiverBalanceDisplay />
      }
    </>
  );
};

export default SendToAddressForm;
