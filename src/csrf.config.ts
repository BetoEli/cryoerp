import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => {
    if (!process.env.CSRF_SECRET) throw new Error('CSRF_SECRET is not defined');
    return process.env.CSRF_SECRET;
  },
  getSessionIdentifier: (req) => req.cookies?.['access_token'] ?? '',
  cookieName: '__csrf',
  cookieOptions: { sameSite: 'strict', secure: false, httpOnly: false, path: '/' },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});

export { doubleCsrfProtection, generateCsrfToken };
