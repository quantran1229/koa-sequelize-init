import {
  cfg
} from '../config';
import cors from 'kcors';

function checkOriginAgainstWhitelist(ctx) {
  const requestOrigin = ctx.accept.headers.origin;
  if (cfg('WHITELIST').includes('*')) {
    return '*';
  }
  if (!cfg('WHITELIST').includes(requestOrigin)) {
    if (requestOrigin.search(/(http|https)/) === 0) {
      return ctx.throw(`${requestOrigin} is not a valid origin`);
    } else { //allow if it is an application. not web page
      return null;
    }
  }
  return requestOrigin;
}

export default cors({
  origin: checkOriginAgainstWhitelist
});