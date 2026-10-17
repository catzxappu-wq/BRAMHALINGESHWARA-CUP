import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'sbk2026_super_secure_jwt_secret_99f381ab7c2098d4';
const COOKIE_NAME = 'admin_session';

export interface AdminSession {
  id: string;
  username: string;
  role: 'supervisor' | 'normal';
  mustChangePassword: boolean;
  permissions?: string[];
}

export function signToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Verify that the admin is still active in DB
  const admin = await prisma.admin.findUnique({
    where: { id: decoded.id },
    include: { permissions: true },
  });

  if (!admin || !admin.isActive) return null;

  return {
    id: admin.id,
    username: admin.username,
    role: admin.role as 'supervisor' | 'normal',
    mustChangePassword: admin.mustChangePassword,
    permissions: admin.permissions.map((p) => p.permissionKey),
  };
}

export async function requireAuth(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireSupervisor(): Promise<AdminSession> {
  const session = await requireAuth();
  if (session.role !== 'supervisor') {
    throw new Error('FORBIDDEN');
  }
  return session;
}

export async function hasPermission(session: AdminSession, permissionKey: string): Promise<boolean> {
  if (session.role === 'supervisor') return true;
  return !!session.permissions?.includes(permissionKey);
}

export async function logAdminActivity(
  adminId: string | null,
  adminUsername: string | null,
  action: string,
  targetType: string,
  targetId?: string,
  safeMetadata?: Record<string, any>
) {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId: adminId || null,
        adminUsername: adminUsername || 'system',
        action,
        targetType,
        targetId: targetId || null,
        safeMetadata: safeMetadata ? JSON.stringify(safeMetadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
}
