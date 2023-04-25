const isObjectEmpty = (objectName: object | null) => {
  if (objectName === null) return true;
  return (
    objectName &&
    Object.keys(objectName).length === 0 &&
    objectName.constructor === Object
  );
};

export default isObjectEmpty;
