import { parse } from "tinyduration";

//Parse seconds to 1h2m3s format
export const toHMS = (secs) => {
  let sec_num = parseInt(secs, 10);
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor(sec_num / 60) % 60;
  let seconds = sec_num % 60;

  return `${hours}h${minutes}m${seconds}s`;
};

/**
 * Parse Timestamp (1h2m3s) to seconds.
 */
export const convertTimestamp = (timestamp) => {
  try {
    timestamp = parse(`PT${timestamp.toUpperCase()}`);
    timestamp = (timestamp?.hours || 0) * 60 * 60 + (timestamp?.minutes || 0) * 60 + (timestamp?.seconds || 0);
  } catch {
    timestamp = 0;
  }

  return timestamp;
};

/**
 * HHMMSS to seconds
 */
export const toSeconds = (hms) => {
  const time = hms.split(":");

  return +time[0] * 60 * 60 + +time[1] * 60 + +time[2];
};

/**
 * seconds to HHMMSS
 */
export const toHHMMSS = (secs) => {
  var sec_num = parseInt(secs, 10);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor(sec_num / 60) % 60;
  var seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map((v) => (v < 10 ? "0" + v : v))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
};
