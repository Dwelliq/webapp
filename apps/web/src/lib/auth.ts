import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "../../../../generated/prisma/client";

// Singleton Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Get the current authenticated user from Clerk and sync with Prisma
 * Returns the user record with id, email, and kycStatus
 * Creates the user in Prisma if they don't exist
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Get user info from Clerk
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  const name = clerkUser.firstName && clerkUser.lastName
    ? `${clerkUser.firstName} ${clerkUser.lastName}`
    : clerkUser.firstName || clerkUser.username || null;

  if (!email) {
    return null;
  }

  // Find or create user in Prisma
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    // Create user if doesn't exist
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
        kycStatus: null, // KYC status starts as null
      },
    });
  } else {
    // Update email/name if they've changed in Clerk
    if (user.email !== email || user.name !== name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          name,
        },
      });
    }
  }

  return {
    id: user.id,
    email: user.email,
    kycStatus: user.kycStatus,
  };
}

