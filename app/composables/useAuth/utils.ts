import { md5 } from 'js-md5';

export function buildSessionParams(auth: AuthData) {
  const {
    apiKey,
    authMethod = 'token',
    password = '',
    server,
    username,
  } = auth;

  switch (authMethod) {
    case 'apiKey':
      return {
        apiKey,
        authMethod,
        server: normaliseServerUrl(server),
      };
    case 'legacy':
      return {
        authMethod,
        password: `enc:${toHex(password)}`,
        server: normaliseServerUrl(server),
        username,
      };
    default: {
      const salt = generateRandomString();

      return {
        authMethod,
        salt,
        server: normaliseServerUrl(server),
        token: md5(`${password}${salt}`),
        username,
      };
    }
  }
}
