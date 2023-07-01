import React from 'react';
import Icon from 'components/Icon';
import { IbannnerProps } from './index';

const week2StartTimeStr = 'Jul 6 2023 13:00:00 UTC';

enum ACTIVITY_URL {
  'WEEK1' = 'https://activity.manta.network/the-manta-shield/stablecoin-launch-event1',
  'WEEK2' = 'https://activity.manta.network/the-manta-shield/stablecoin-launch-event2'
}

const TradingIncentiveBanner: React.FC<IbannnerProps> = (props) => {
  let activityUrl = '';
  let date = new Date().getTime();
  if (date < new Date(week2StartTimeStr).getTime()) {
    activityUrl = ACTIVITY_URL.WEEK1;
  } else {
    activityUrl = ACTIVITY_URL.WEEK2;
  }
  return (
    <div
      className={props.className + ' bg-trading-stablecoin-banner'}
      onClick={() => window.open(activityUrl)}>
      <div className="mr-4 font-red-hat-mono text-white">
        Earn 30000% of your gas fee paid & additional bonus!
      </div>
      <div className="mr-4 font-red-hat-mono text-white">
        Find more details here
      </div>
      <Icon className="w-6 h-6 cursor-pointer" name="activityRightArrow" />
    </div>
  );
};
export default TradingIncentiveBanner;
