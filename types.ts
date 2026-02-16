
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN'
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  PARTIAL = 'Partial',
  ABSENT = 'Absent',
  FLAGGED = 'Flagged',
  APPROVED = 'Approved'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO string
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInLat: number | null;
  checkInLng: number | null;
  checkOutLat: number | null;
  checkOutLng: number | null;
  checkInAddress: string | null;
  checkOutAddress: string | null;
  status: AttendanceStatus;
  flagged: boolean;
  reason?: string;
}

export interface CompanySettings {
  officeLat: number;
  officeLng: number;
  allowedRadiusMeters: number;
  workStartTime: string;
  workEndTime: string;
}
