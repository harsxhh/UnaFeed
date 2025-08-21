import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dl3cveveh',
  api_key: '571557557596629',
  api_secret: 'cW4imhAD_yca4RW_4RoZqD64Xfk'
});

export function generateSignature(params) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder: 'unafeed',
    ...params
  };

  // Create string to sign
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(sortedParams + 'cW4imhAD_yca4RW_4RoZqD64Xfk')
    .digest('hex');

  return {
    signature,
    timestamp,
    api_key: '571557557596629',
    folder: 'unafeed'
  };
}

export default cloudinary;
