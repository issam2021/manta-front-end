// @ts-nocheck
import { usePrivateWallet } from 'contexts/privateWalletContext';
import SendToAddressForm from './SendToAddressForm';

const INTERNAL_ACCOUNT_LABEL = 'Private';

const toReactSelectOption = (address) => {
  return {
    value: { address },
    label: INTERNAL_ACCOUNT_LABEL
  };
};

const SendToPrivateAddressForm = () => {
  const { privateAddress } = usePrivateWallet();
  const options = privateAddress ? [privateAddress] : [];

  return (
    <SendToAddressForm
      options={options}
      toReactSelectOption={toReactSelectOption}
      isPrivate={true}
    />
  );
};

export default SendToPrivateAddressForm;
