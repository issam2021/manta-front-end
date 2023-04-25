// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Button from 'components/Button';
import ErrorText from 'components/Error/ErrorText';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { useTxStatus } from 'contexts/txStatusContext';
import { useStakeData } from '../StakeContext/StakeDataContext';
import { useStakeTx } from '../StakeContext/StakeTxContext';
import ModalNotes from './ModalNotes';

export const CancelUnstakeModal = ({hideModal}) => {
  const { selectedUnstakeRequest, userAvailableBalance } = useStakeData();
  const {
    getUserCanCancelUnstake,
    getUserHasSufficientFundsToCancelUnstake,
    cancelUnstake
  } = useStakeTx();

  const { externalAccount } = usePublicAccount();
  const { txStatus } = useTxStatus();

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const getErrorMessage = async () => {
      if (!externalAccount) {
        setErrorMessage('Wallet not connected');
      } else if (txStatus?.isProcessing()) {
        setErrorMessage('Transaction in progress');
      } else if (!selectedUnstakeRequest || !userAvailableBalance) {
        setErrorMessage(null);
      } else if (!(await getUserHasSufficientFundsToCancelUnstake())) {
        setErrorMessage('Insufficient balance to pay fees');
      } else {
        setErrorMessage(null);
      }
    };
    getErrorMessage();
  }, [selectedUnstakeRequest, userAvailableBalance]);

  const onClickCancelUnstake = async () => {
    const userCanCancelUnstake = await getUserCanCancelUnstake();
    if (userCanCancelUnstake) {
      cancelUnstake();
      hideModal();
    }
  };

  const cancelAmountText = `Unstaking balance: ${selectedUnstakeRequest.unstakeAmount.toDisplayString(0)} `;
  const notes = [
    'This will restake your tokens and allow you to earn staking rewards again.',
    'You will need to unstake again and wait seven days before you can withdraw.'
  ];

  return (
    <div className="w-96 py-4 bg-primary rounded-2xl">
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-secondary text-lg">
          {selectedUnstakeRequest.collator.name}
        </h1>
      </div>
      <div className="mt-4">
        <h1 className="text-secondary text-left text-sm font-medium">
          {cancelAmountText}
        </h1>
      </div>
      <ErrorText errorMessage={errorMessage}/>
      <div className="mt-3 w-full">
        <Button className="w-full btn-primary pt-2" onClick={onClickCancelUnstake}>Cancel Unstake</Button>
      </div>
      <ModalNotes notes={notes} />
    </div>
  );
};

export default CancelUnstakeModal;
