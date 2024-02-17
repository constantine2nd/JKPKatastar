export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  avatarUrl: string;
  isActive: boolean;
  isVerified: boolean;
  token: string;
}
