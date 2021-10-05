import React from 'react';
import Button from 'components/elements/Button';
import Svgs from 'resources/icons';
import FormSelect from 'components/elements/Form/FormSelect';

const ReceiveContent = () => {
  return (
    <div className="receive-content">
      <div className="py-2">
        <FormSelect label="Token" coinIcon={Svgs.TokenIcon} />
      </div>
      <img className="mx-auto" src={Svgs.ArrowDownIcon} alt="switch-icon" />
      <div className="py-2">
        <div className="flex pb-4 pt-2 px-2 items-center text-xl">
          <img className="pr-2" src={Svgs.WalletIcon} alt="setting-icon" />
          <span className="text-lg manta-gray">0xa016f295a5957...00AdX24</span>
        </div>
      </div>
      <Button className="btn-primary w-full btn-hover text-lg py-3">
        New address
      </Button>
    </div>
  );
};

export default ReceiveContent;