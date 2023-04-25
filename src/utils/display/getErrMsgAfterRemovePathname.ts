// to get a short string because of the UI
const getErrMsgAfterRemovePathname = (errorMessage: string) => {
  const origin = window?.location?.origin;
  if (errorMessage.includes(origin)) {
    const regex = new RegExp(`(${origin})\\S+\\s`, 'g');
    return errorMessage.replace(regex, '$1 ');
  }
  return errorMessage;
};

export default getErrMsgAfterRemovePathname;
