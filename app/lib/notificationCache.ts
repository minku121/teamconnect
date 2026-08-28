import { redis } from './redis';

export const getNotificationCacheKey = (userId: string | number): string => {
  return `user:${userId}:notifications`;
};

export const invalidateNotificationCache = async (userId: string | number): Promise<void> => {
  try {
    const key = getNotificationCacheKey(userId);
    await redis.del(key);
  } catch (error) {
    console.error(`Failed to invalidate notification cache for user ${userId}:`, error);
  }
};

export const invalidateMultipleUsersCache = async (userIds: (string | number)[]): Promise<void> => {
  if (!userIds || userIds.length === 0) return;

  try {
    const pipeline = redis.pipeline();
    userIds.forEach(userId => {
      pipeline.del(getNotificationCacheKey(userId));
    });
    await pipeline.exec();
  } catch (error) {
    console.error(`Failed to invalidate notification cache for multiple users:`, error);
  }
};
