const giantSquidStartTimeStr =
  'Thu Mar 16 2023 00:00:00 GMT+0800 (中国标准时间)';
const giantSquidEndTimeStr = 'Fri Mar 31 2023 00:00:00 GMT+0800 (中国标准时间)';

const tradingIncentiveStartTimeStr = 'Apr 28 2023 12:00:00 UTC';
const tradingIncentiveEndTimeStr = 'Jun 02 2023 2:00:00 UTC';

const incentiveAllowStartTimeStr = 'Jun 29 2023 1:00:00 UTC';
const incentiveAllowEndTimeStr = 'Jul 4 2023 1:00:00 UTC';

const stableCoinStartTimeStr = 'Jun 29 2023 13:00:00 UTC';
const stableCoinEndTimeStr = 'Jul 13 2023 13:00:00 UTC';

const incentiveChapter3StartTimeStr = 'Jul 31 2023 13:00:00 UTC';
const incentiveChapter3EndTimeStr = 'Aug 27 2023 13:00:00 UTC';

export const getGiantSquidBannerIsActive = (): boolean => {
  return getTimeWindowIsActive(
    new Date(),
    new Date(giantSquidStartTimeStr),
    new Date(giantSquidEndTimeStr)
  );
};
export const getTradingIncentiveBannerIsActive = (): boolean => {
  return getTimeWindowIsActive(
    new Date(),
    new Date(tradingIncentiveStartTimeStr),
    new Date(tradingIncentiveEndTimeStr)
  );
};
export const getIncentiveAllowListBannerIsActive = (): boolean => {
  return getTimeWindowIsActive(
    new Date(),
    new Date(incentiveAllowStartTimeStr),
    new Date(incentiveAllowEndTimeStr)
  );
};
export const getStableCoinBannerIsActive = (): boolean => {
  return getTimeWindowIsActive(
    new Date(),
    new Date(stableCoinStartTimeStr),
    new Date(stableCoinEndTimeStr)
  );
};
export const getChapter3BannerIsActive = (): boolean => {
  return getTimeWindowIsActive(
    new Date(),
    new Date(incentiveChapter3StartTimeStr),
    new Date(incentiveChapter3EndTimeStr)
  );
};
export const getTimeWindowIsActive = (
  time: Date,
  startTime: Date,
  endTime: Date
): boolean => {
  const targetTimeStamp = new Date(time.toUTCString()).getTime();
  const startTimeStamp = new Date(startTime.toUTCString()).getTime();
  const endTimeStamp = new Date(endTime.toUTCString()).getTime();
  if (targetTimeStamp <= endTimeStamp && targetTimeStamp >= startTimeStamp) {
    return true;
  }
  return false;
};
