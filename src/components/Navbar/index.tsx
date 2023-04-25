// @ts-nocheck
import React from 'react';
import AccountSelectMenu from 'components/Accounts/AccountSelectMenu';
import Menu from 'components/Menu/DotMenu';
import ActivityBanner from 'components/ActivityBanner';
import { useGlobal } from 'contexts/globalContexts';
import NavLinks from './NavLinks';
import ChainSelector from './ChainSelector';
import ZkAccountButton from './ZkAccountButton';

export const Navbar = () => {
  const isSendPage = window?.location?.pathname?.includes('/transact');
  const { usingMantaWallet } = useGlobal();
  return (
    <div>
      <ActivityBanner />
      <div className="h-20 py-4 px-10 flex justify-between items-center relative sticky left-0 right-0 top-0 z-50 bg-primary">
        <div className="flex items-center">
          <ChainSelector className="place-self-start" />
          <NavLinks />
        </div>
        <div className="h-10 gap-4 flex flex-wrap justify-end items-center">
          {isSendPage && !usingMantaWallet && <ZkAccountButton />}
          <AccountSelectMenu />
          <Menu />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
