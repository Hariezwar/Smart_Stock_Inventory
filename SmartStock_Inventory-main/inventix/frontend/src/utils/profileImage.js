import API_BASE from '../config/api';

export function getProfileImageUrl(profileImageUrl) {
  if (!profileImageUrl) return null;
  if (/^https?:\/\//i.test(profileImageUrl)) return profileImageUrl;
  return `${API_BASE}${profileImageUrl}`;
}
