/** Log only in development to reduce overhead in production. */
export const devLog = (...args) => {
  if (__DEV__) console.log(...args);
};
export const devError = (...args) => {
  if (__DEV__) console.error(...args);
};
