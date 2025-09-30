import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

// Generate random avatar URL
export const generateAvatar = (seed = null) => {
  const avatarSeed = seed || Math.random().toString(36).substring(7);
  
  const avatar = createAvatar(avataaars, {
    seed: avatarSeed,
    size: 40,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
    radius: 50,
  });

  return avatar.toDataUri();
};

// Generate avatar for user based on their name or email
export const generateUserAvatar = (userName, userEmail) => {
  // Use email as seed for consistent avatar per user
  const seed = userEmail || userName || Math.random().toString(36).substring(7);
  return generateAvatar(seed);
};
