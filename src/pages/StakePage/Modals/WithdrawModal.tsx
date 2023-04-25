// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Button from 'components/Button';
import ErrorText from 'components/Error/ErrorText';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { useTxStatus } from 'contexts/txStatusContext';
import { useStakeData } from '../StakeContext/StakeDataContext';
import { useStakeTx } from '../StakeContext/StakeTxContext';
import ModalNotes from './ModalNotes';

export const WithdrawModal = ({hideModal}) => {
  const { selectedUnstakeRequest, userAvailableBalance } = useStakeData();
  const { getUserCanWithdraw, getUserHasSufficientFundsToWithdraw, withdraw } = useStakeTx();
  const { externalAccount } = usePublicAccount();
  const { txStatus } = useTxStatus();

  const [errorMessage, setErrorMessage] = useState(null);

  const onClickWithdraw = async () => {
    const userCanStake = await getUserCanWithdraw();
    if (userCanStake) {
      withdraw();
      hideModal();
    }
  };

  useEffect(() => {
    const getErrorMessage = async () => {
      if (!externalAccount) {
        setErrorMessage('Wallet not connected');
      } else if (txStatus?.isProcessing()) {
        setErrorMessage('Transaction in progress');
      }
      else if (!selectedUnstakeRequest || !userAvailableBalance) {
        setErrorMessage(null);
      } else if (!(await getUserHasSufficientFundsToWithdraw())) {
        setErrorMessage('Insufficient balance to pay fees');
      } else {
        setErrorMessage(null);
      }
    };
    getErrorMessage();
  }, [selectedUnstakeRequest, userAvailableBalance]);

  const withdrawAmountText = `Withdrawal amount: ${selectedUnstakeRequest.unstakeAmount.toDisplayString(0)} `;
  const notes = [
    'Withdrawn tokens are fully unstaked.',
    'You can transfer or stake withdrawn tokens without restriction.'
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
          {withdrawAmountText}
        </h1>
      </div>
      <ErrorText errorMessage={errorMessage}/>
      <div className="mt-3 w-full">
        <Button className="w-full btn-primary" onClick={onClickWithdraw}>Withdraw</Button>
      </div>
      <ModalNotes notes={notes}/>
    </div>
  );
};

export default WithdrawModal;
