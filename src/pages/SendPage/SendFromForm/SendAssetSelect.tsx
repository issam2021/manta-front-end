// @ts-nocheck
import React from 'react';
import SendBalanceInput from 'pages/SendPage/SendBalanceInput';
import AssetTypeSelectButton from 'components/Assets/AssetTypeSelectButton';
import { useZkAccountBalances } from 'contexts/zkAccountBalancesContext';
import { useSend } from '../SendContext';

const SendAssetSelect = () => {
  const {
    senderAssetType,
    senderAssetTypeOptions,
    setSelectedAssetType,
    publicBalances
  } = useSend();
  const zkAccountBalances = useZkAccountBalances();
  const privateBalances = zkAccountBalances.balances.map((balance) => balance.privateBalance);

  let balances;
  if (!senderAssetType) {
    balances = [];
  } else if (senderAssetType.isPrivate) {
    balances = privateBalances;
  } else {
    balances = publicBalances;
  }

  return (
    <div className="w-100 relative">
      <AssetTypeSelectButton
        assetType={senderAssetType}
        setSelectedAssetType={setSelectedAssetType}
        balances={balances}
        senderAssetTypeOptions={senderAssetTypeOptions}
      />
      <SendBalanceInput />
    </div>
  );
};

export default SendAssetSelect;
