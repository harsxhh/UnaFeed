import { v4 as uuidv4 } from 'uuid';

export function ensureDeviceId(req, res, next) {
  const existing = req.cookies?.deviceId;
  if (!existing) {
    const deviceId = uuidv4();
    res.cookie('deviceId', deviceId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    req.deviceId = deviceId;
  } else {
    req.deviceId = existing;
  }
  next();
}

