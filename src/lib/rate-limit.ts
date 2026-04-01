import { prisma } from "./prisma";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

/**
 * Check if an email is rate-limited for login.
 * Returns { blocked: true, minutesLeft } if too many failed attempts.
 */
export async function checkLoginRateLimit(email: string): Promise<{ blocked: boolean; minutesLeft: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      email: email.toLowerCase().trim(),
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  if (failedAttempts >= MAX_ATTEMPTS) {
    // Find the oldest attempt in the window to calculate remaining time
    const oldest = await prisma.loginAttempt.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        success: false,
        createdAt: { gte: windowStart },
      },
      orderBy: { createdAt: "asc" },
    });

    const unblockAt = oldest
      ? new Date(oldest.createdAt.getTime() + WINDOW_MINUTES * 60 * 1000)
      : new Date(Date.now() + WINDOW_MINUTES * 60 * 1000);

    const minutesLeft = Math.ceil((unblockAt.getTime() - Date.now()) / 60000);
    return { blocked: true, minutesLeft: Math.max(1, minutesLeft) };
  }

  return { blocked: false, minutesLeft: 0 };
}

/**
 * Record a login attempt (success or failure).
 * On success, clears all previous failed attempts for this email.
 */
export async function recordLoginAttempt(email: string, success: boolean) {
  const normalizedEmail = email.toLowerCase().trim();

  if (success) {
    // Clear failed attempts on successful login
    await prisma.loginAttempt.deleteMany({
      where: { email: normalizedEmail, success: false },
    });
  }

  await prisma.loginAttempt.create({
    data: { email: normalizedEmail, success },
  });
}
