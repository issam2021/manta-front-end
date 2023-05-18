import { useConfig } from 'contexts/configContext';
import { useMantaWallet } from 'contexts/mantaWalletContext';
import AssetType from 'types/AssetType';
import { useSend } from '../SendContext';

const SendErrorDisplay = () => {
  const config = useConfig();
  const nativeTokenTicker = AssetType.Native(config).ticker;

  const { txWouldDepleteSuggestedMinFeeBalance } = useSend();
  const { txFee } = useMantaWallet();
  const fee = txFee?.current?.toString() || 1;

  const shouldShowRetainFeeWarning = txWouldDepleteSuggestedMinFeeBalance();

  const shouldRetainFeeWarningText = `Please reserve some ${nativeTokenTicker} for future transaction fees. The current fee is about ${fee} ${nativeTokenTicker} per transaction.`;

  return (
    <>
      {shouldShowRetainFeeWarning ? (
        <div className="mt-4 send-error-display text-warning border-2 border-warning bg-light-warning pl-4 p-3 rounded-md text-sm">
          {shouldRetainFeeWarningText}
        </div>
      ) : null}
    </>
  );
};

export default SendErrorDisplay;
