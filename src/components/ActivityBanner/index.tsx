import React, { useEffect, useState } from 'react';
import {
  getGiantSquidBannerIsActive,
  getTradingIncentiveBannerIsActive
} from 'utils/time/timeDuring';
import Icon from 'components/Icon';
import GiantSquidBanner from './GiantSquidBanner';
import TradingIncentiveBanner from './TradingIncentiveBanner';

export enum BANNER_TYPE {
  GIANT_SQUID,
  TRADING_INCENTIVE,
  DEFAULT
}

export interface IbannnerProps {
  className: string;
}

const normalClass =
  'flex h-68 cursor-pointer items-center justify-center bg-giant-squid font-red-hat-mono text-sm font-semibold leading-19 text-banner';

const ActivityBanner: React.FC<object> = () => {
  const [bannerType, setBannerType] = useState(BANNER_TYPE.DEFAULT);

  useEffect(() => {
    if (getGiantSquidBannerIsActive()) {
      setBannerType(BANNER_TYPE.GIANT_SQUID);
    } else if (getTradingIncentiveBannerIsActive()) {
      setBannerType(BANNER_TYPE.TRADING_INCENTIVE);
    } else {
      setBannerType(BANNER_TYPE.DEFAULT);
    }
  }, []);

  return (
    <div className="h-12 bg-white bg-opacity-20 text-white flex items-center justify-center gap-4">
      <a
        href="https://twitter.com/CalamariNetwork"
        target="_blank"
        rel="noreferrer"
        className="hover:text-white font-red-hat-mono">
        Calamari Chain Halted. Please click here to receive the most recent
        updates.
      </a>
      <Icon className="w-4 h-4 cursor-pointer" name="activityRightArrow" />
    </div>
  );

  if (bannerType === BANNER_TYPE.GIANT_SQUID) {
    return <GiantSquidBanner className={normalClass} />;
  } else if (bannerType === BANNER_TYPE.TRADING_INCENTIVE) {
    return <TradingIncentiveBanner className={normalClass} />;
  }
  return null;
};
export default ActivityBanner;
