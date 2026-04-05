// frontend/src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'organizer' | 'admin';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: 'draft' | 'published' | 'cancelled';
  organizerId: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'customer' | 'organizer';
}
