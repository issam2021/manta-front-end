import React from 'react';
import Icon from 'components/Icon';
import { IbannnerProps } from './index';
const GiantSquidBanner: React.FC<IbannnerProps> = (props) => {
  return (
    <div
      className={props.className}
      onClick={() => window.open('https://galxe.com/mantanetwork/campaigns')}>
      <div className="mr-4">
        KMA holders can participate in the Giant Squid Program on Galxe.com now!
      </div>
      <div className="mr-4">Find more details here</div>
      <Icon className="w-6 h-6 cursor-pointer" name="activityRightArrow" />
    </div>
  );
};
export default GiantSquidBanner;
