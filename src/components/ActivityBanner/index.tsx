import {
  getGiantSquidBannerIsActive,
  getTradingIncentiveBannerIsActive,
  getIncentiveAllowListBannerIsActive,
  getStableCoinBannerIsActive,
  getChapter3BannerIsActive
} from 'utils/time/timeDuring';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';
import GiantSquidBanner from './GiantSquidBanner';
import TradingIncentiveBanner from './TradingIncentiveBanner';
import IncentiveAllowListBanner from './IncentiveAllowListBanner';
import StableCoinBanner from './StableCoinBanner';
import IncentiveChapter3Banner from './IncentiveChapter3Banner';
import 'swiper/swiper.scss';

export interface IbannnerProps {
  className: string;
}

const normalClass =
  'flex h-68 cursor-pointer items-center justify-center bg-giant-squid font-red-hat-mono text-sm font-semibold leading-19 text-banner';

const whiteClass =
  'flex h-68 cursor-pointer items-center justify-center bg-giant-squid font-red-hat-mono text-sm font-semibold leading-19 text-white';

const ActivityBanner: React.FC<object> = () => {
  if (
    !getGiantSquidBannerIsActive() &&
    !getTradingIncentiveBannerIsActive() &&
    !getIncentiveAllowListBannerIsActive() &&
    !getStableCoinBannerIsActive() &&
    !getChapter3BannerIsActive()
  ) {
    return null;
  }
  return (
    <div className="relative w-full h-68">
      <Swiper
        modules={[Autoplay]}
        centeredSlides={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: true,
          pauseOnMouseEnter: true
        }}
        loop={true}>
        {getGiantSquidBannerIsActive() && (
          <SwiperSlide>
            <GiantSquidBanner className={normalClass} />
          </SwiperSlide>
        )}
        {getTradingIncentiveBannerIsActive() && (
          <SwiperSlide>
            <TradingIncentiveBanner className={normalClass} />
          </SwiperSlide>
        )}
        {getIncentiveAllowListBannerIsActive() && (
          <SwiperSlide>
            <IncentiveAllowListBanner className={whiteClass} />
          </SwiperSlide>
        )}
        {getStableCoinBannerIsActive() && (
          <SwiperSlide>
            <StableCoinBanner className={whiteClass} />
          </SwiperSlide>
        )}
        {getChapter3BannerIsActive() && (
          <SwiperSlide>
            <IncentiveChapter3Banner className={whiteClass} />
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
};
export default ActivityBanner;
