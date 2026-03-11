import { parse } from 'tinyduration';

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
 * seconds to HHMMSS
 */
export const toSeconds = (hms) => {
  var p = hms.split(':'),
    s = 0,
    m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }

  return s;
};

/**
 * Parse seconds to 1h2m3s format
 */
export const toHMS = (secs) => {
  let sec_num = parseInt(secs, 10);
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor(sec_num / 60) % 60;
  let seconds = sec_num % 60;

  return `${hours}h${minutes}m${seconds}s`;
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
    .map((v) => (v < 10 ? '0' + v : v))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};

/**
 * Sleep function
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Get image URL with supported dimensions
 * Handles older vod links that had {width}x{height} placeholder
 * @param {string} link - Image URL
 * @param {number} width - Desired width (default: 40)
 * @param {number} height - Desired height (default: 53)
 * @returns {string} Image URL
 */
export const getImage = (link, width = 40, height = 53) => {
  if (!link) return 'https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg';
  return link.replace('{width}x{height}', `${width}x${height}`);
};
