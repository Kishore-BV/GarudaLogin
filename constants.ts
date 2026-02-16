
import { User, UserRole, CompanySettings, AttendanceStatus, AttendanceLog } from './types';

export const CLAY_SHADOW = "shadow-[8px_8px_16px_rgba(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)]";
export const CLAY_INSET = "shadow-[inset_8px_8px_16px_rgba(163,177,198,0.6),inset_-8px_-8px_16px_rgba(255,255,255,0.8)]";
export const CLAY_BORDER = "border border-white/40";

export const MOCK_USERS: User[] = [
  {
    id: 'emp001',
    name: 'Alex Johnson',
    email: 'alex@bluemark.com',
    role: UserRole.EMPLOYEE,
    department: 'Engineering',
    avatar: 'https://picsum.photos/seed/alex/200'
  },
  {
    id: 'adm001',
    name: 'Sarah Smith',
    email: 'admin@bluemark.com',
    role: UserRole.ADMIN,
    department: 'Human Resources',
    avatar: 'https://picsum.photos/seed/sarah/200'
  }
];

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  officeLat: 37.7749, // San Francisco example
  officeLng: -122.4194,
  allowedRadiusMeters: 200,
  workStartTime: '09:00',
  workEndTime: '17:00'
};

export const INITIAL_LOGS: AttendanceLog[] = [
  {
    id: 'log1',
    userId: 'emp001',
    userName: 'Alex Johnson',
    date: new Date(Date.now() - 86400000).toISOString(),
    checkInTime: '08:55',
    checkOutTime: '17:05',
    checkInLat: 37.7748,
    checkInLng: -122.4193,
    checkOutLat: 37.7748,
    checkOutLng: -122.4193,
    checkInAddress: '123 Tech Hub, SF',
    checkOutAddress: '123 Tech Hub, SF',
    status: AttendanceStatus.PRESENT,
    flagged: false
  }
];
