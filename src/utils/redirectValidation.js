// Only ever allow redirecting to an internal, same-origin path — blocks
// protocol-relative URLs ("//evil.com") and anything not starting with "/".
export function isSafeInternalRedirect(path) {
  return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\');
}
