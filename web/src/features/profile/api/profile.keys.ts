export const profileKeys = {
  all: ['profile'] as const,
  byUser: (userId: string) => [...profileKeys.all, userId] as const,
}
