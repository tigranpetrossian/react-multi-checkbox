export function isBrowser() {
  return typeof window !== 'undefined' && window.document;
}

export function isTouchDevice() {
  return isBrowser() && !!navigator.maxTouchPoints;
}

export function isMac() {
  return isBrowser() && navigator.userAgent.includes('Mac') && !isTouchDevice();
}
