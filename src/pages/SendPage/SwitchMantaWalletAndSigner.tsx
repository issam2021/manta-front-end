import classNames from 'classnames';
import Icon from 'components/Icon';
import { useGlobal } from 'contexts/globalContexts';
import { useTxStatus } from 'contexts/txStatusContext';
import useLastAccessedWallet from 'hooks/useLastAccessedWallet';

const SwitchMantaWalletAndSigner = () => {
  const { resetLastAccessedWallet } = useLastAccessedWallet();
  const { usingMantaWallet, setUsingMantaWallet } = useGlobal();

  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();

  const toggleUsingMantaWalletState = async () => {
    if (disabled) {
      return;
    }
    await resetLastAccessedWallet();
    setUsingMantaWallet(!usingMantaWallet);
  };

  const toggleWalletStateText = usingMantaWallet
    ? 'Manta Signer user? And still want to use it?'
    : 'Manta Wallet is live! Try MantaPay with Manta Wallet';

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleUsingMantaWalletState}
        className={classNames(
          'px-6 rounded-3xl border border-solid border-white h-9 flex',
          'items-center cursor-hover text-white opacity-60 text-sm cursor-pointer',
          { disabled: disabled }
        )}>
        <span>{toggleWalletStateText}</span>
        <Icon
          className="w-4 h-4 ml-2 cursor-pointer"
          name="activityRightArrow"
        />
      </button>
      <a
        className="mt-6 flex items-center mb-6 text-sm leading-5 text-white hover:text-white opacity-60"
        href="https://docs.manta.network/docs/guides/MantaWalletMigration"
        target="_blank"
        rel="noopener noreferrer">
        <span>Learn how to migrate from Manta Signer to Manta Wallet</span>
        <Icon
          className="w-4 h-4 ml-2 cursor-pointer"
          name="activityRightArrow"
        />
      </a>
    </div>
  );
};

export default SwitchMantaWalletAndSigner;
