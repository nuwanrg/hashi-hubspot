import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  vus: 2,
  duration: '30s',
};
export default  () =>{
  http.get('https://muffinwallet.xyz/hub/getETHWalletDetails?asociatedObjectId=101&eth_address=0x1dafF752b4218a759B86FFb48a5B22086eA9F445');
  sleep(1);
};
