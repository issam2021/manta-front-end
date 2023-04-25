// @ts-nocheck
import Version from 'types/Version';

const versionIsOutOfDate = (minRequiredVersionStr, version) => {
  const minRequiredVersion = new Version(minRequiredVersionStr);
  return version && !version.gte(minRequiredVersion);
};

export default versionIsOutOfDate;


