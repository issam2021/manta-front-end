// @ts-nocheck
import React from 'react';
import DotLoader from 'components/Loaders/DotLoader';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { formatHoursMinutes } from 'utils/time/timeString';
import { useConfig } from 'contexts/configContext';
import { useStakeData } from './StakeContext/StakeDataContext';

const AccountDisplay = () => {
  const config = useConfig();
  const {
    userTotalBalance,
    userAvailableBalance,
    userStakedBalance,
    userTotalRecentRewards,
    secondsSinceReward
  } = useStakeData();

  const { externalAccount } = usePublicAccount();

  const getBalanceDisplayString = (balance) => {
    if (!externalAccount) {
      return '';
    } else if (!balance) {
      return <DotLoader />;
    } else {
      return balance.toDisplayString(0);
    }
  };

  const blockExplorerRewardsLink = `${config.SUBSCAN_URL}/nominator/${externalAccount?.address}?tab=reward`;
  const timeSinceRewardDisplayString = secondsSinceReward
    ? `Last updated: ${formatHoursMinutes(secondsSinceReward)} ago`
    : '';
  const totalBalanceDisplayString = getBalanceDisplayString(userTotalBalance);
  const avialableBalanceDisplayString =
    getBalanceDisplayString(userAvailableBalance);
  const stakedBalanceDisplayString = getBalanceDisplayString(userStakedBalance);
  const userTotalRecentRewardsDisplayString = getBalanceDisplayString(
    userTotalRecentRewards
  );

  const onClickStartStaking = () => {
    const element = document.getElementById('collatorsTable');
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  };

  return (
    <div className="text-center font-red-hat-text">
      <div className="inline-flex xl:flex-nowrap justify-start flex-wrap-reverse gap-4">
        <div className="-mt-2 px-14 py-4 bg-secondary flex-grow rounded-lg gap-10 relative z-20 flex justify-evenly items-center shadow-2xl">
          <div className="mt-4">
            <h2 className="text-white text-center font-medium text-base font-red-hat-text">
              Total Balance
            </h2>
            <h1 className="text-white font-bold text-xl text-center mt-4">
              {totalBalanceDisplayString}
            </h1>
            <button
              onClick={onClickStartStaking}
              className={
                'mt-8 p-3 cursor-pointer text-sm btn-hover unselectable-text text-center rounded-lg btn-primary w-full'
              }
            >
              Start staking
            </button>
          </div>
          <div className="flex justify-end gap-5">
            <div className=" w-52 h-52 rounded-md border border-white border-opacity-20 text-center pt-12 shadow-lg">
              <h2 className="text-secondary font-medium text-base font-red-hat-text">
                Available Balance
              </h2>
              <h1 className="text-white font-bold text-lg mt-4 font-red-hat-text">
                {avialableBalanceDisplayString}
              </h1>
            </div>
            <div className=" w-52 h-52 rounded-md border border-white border-opacity-20 text-center pt-12 shadow-lg">
              <h2 className="text-secondary font-medium text-base font-red-hat-text">
                Total Staked
              </h2>
              <h1 className="text-white font-bold text-lg mt-4 font-red-hat-text">
                {stakedBalanceDisplayString}
              </h1>
            </div>
            <div className=" w-52 h-52 rounded-md border border-white border-opacity-20 text-center pt-12 shadow-lg">
              <h2 className="text-secondary font-medium text-base font-red-hat-text">
                Rewards Last Round
              </h2>
              <h1 className="text-white font-bold text-lg mt-4 font-red-hat-text">
                {userTotalRecentRewardsDisplayString}
              </h1>
              <h3 className="font-red-hat-text text-white text-opacity-60 font-medium text-xss mt-3">
                {timeSinceRewardDisplayString}
              </h3>
              {userTotalRecentRewards && (
                <div className="mt-3">
                  <a
                    href={blockExplorerRewardsLink}
                    className="text-link text-xss"
                    target="_blank"
                    rel="noreferrer"
                  >
                    More
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="-mt-2 max-w-sm flex flex-grow flex-col items-center justify-center flex-shrink-0 pl-6 pr-34 py-6 bg-secondary rounded-lg relative z-20 shadow-2xl">
          <div className="text-left">
            <h2 className="text-white font-medium text-base font-red-hat-text">Resources</h2>
            <div className="mt-4">
              <a
                href="https://docs.manta.network/docs/calamari/Staking/Overview"
                className="text-third-80 text-sm hover:text-link-hover"
                target="_blank"
                rel="noreferrer"
              >
                Staking documentation
              </a>
            </div>
            <div className="mt-4">
              <a
                href="https://calamari.subscan.io"
                className="text-third-80 text-sm hover:text-link-hover"
                target="_blank"
                rel="noreferrer"
              >
                Calamari block explorer
              </a>
            </div>
            <div className="mt-4">
              <a
                href="https://stakekma.com"
                className="text-third-80 text-sm hover:text-link-hover"
                target="_blank"
                rel="noreferrer"
              >
                StakeKMA collator dashboard
              </a>
            </div>
            <div className="mt-4">
              <a
                href="https://sparta.calamari.systems"
                className="text-third-80 text-sm hover:text-link-hover"
                target="_blank"
                rel="noreferrer"
              >
                Calamari collator dashboard
              </a>
            </div>
            <div className="mt-4">
              <a
                href="https://app.web3go.xyz/#/CalamariStaking"
                className="text-third-80 text-sm hover:text-link-hover"
                target="_blank"
                rel="noreferrer"
              >
                web3go Calamari staking
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDisplay;
