import React from 'react';
import Icon from 'components/Icon';
import { IbannnerProps } from './index';

const week2StartTimeStr = 'May 8 2023 14:00:00 UTC';
const week3StartTimeStr = 'May 15 2023 14:00:00 UTC';
const week4StartTimeStr = 'May 22 2023 14:00:00 UTC';

enum ACTIVITY_URL {
  'WEEK1' = 'https://activity.manta.network/the-manta-shield/week1',
  'WEEK2' = 'https://activity.manta.network/the-manta-shield/week2',
  'WEEK3' = 'https://activity.manta.network/the-manta-shield/week3',
  'WEEK4' = 'https://activity.manta.network/the-manta-shield/week4'
}

const TradingIncentiveBanner: React.FC<IbannnerProps> = (props) => {
  let activityUrl = '';
  let date = new Date().getTime();
  if (date < new Date(week2StartTimeStr).getTime()) {
    activityUrl = ACTIVITY_URL.WEEK1;
  } else if (date < new Date(week3StartTimeStr).getTime()) {
    activityUrl = ACTIVITY_URL.WEEK2;
  } else if (date < new Date(week4StartTimeStr).getTime()) {
    activityUrl = ACTIVITY_URL.WEEK3;
  } else {
    activityUrl = ACTIVITY_URL.WEEK4;
  }
  return (
    <div className={props.className} onClick={() => window.open(activityUrl)}>
      <div className="mr-4 font-red-hat-mono">
        Earn 2000% of your gas fee paid & additional bonus!
      </div>
      <div className="mr-4 font-red-hat-mono">Find more details here</div>
      <Icon className="w-6 h-6 cursor-pointer" name="activityRightArrow" />
    </div>
  );
};
export default TradingIncentiveBanner;
