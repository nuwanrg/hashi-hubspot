import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  vus: 10,
  duration: '30s',
};
export default  () =>{
  http.get('https://muffinwallet.xyz/hub/getBTCWalletDetails?associatedObjectId=101&btc_address=bc1qevr4wsp5kr4dmha20c6klnce262yxt34el9u6w');
  sleep(1);
};
