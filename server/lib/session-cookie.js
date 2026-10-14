const cookieName = 'seduh_session';
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

function cookieOptions(request) {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: request.secure,
    path: '/api',
  };
}

// undefined: cookie tidak dikirim; null: cookie ada tetapi formatnya salah.
export function readSessionToken(request) {
  const header = request.headers.cookie ?? '';
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator !== -1 && part.slice(0, separator).trim() === cookieName) {
      const value = part.slice(separator + 1).trim();
      return tokenPattern.test(value) ? value : null;
    }
  }
  return undefined;
}

export function setSessionCookie(request, response, token, expiresAt) {
  response.cookie(cookieName, token, {
    ...cookieOptions(request),
    expires: new Date(expiresAt),
  });
}

export function clearSessionCookie(request, response) {
  response.clearCookie(cookieName, cookieOptions(request));
}
