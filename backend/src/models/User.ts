import { UserRole } from "./enum";

// Abstract User class
export abstract class User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  abstract login(): Promise<boolean>;
  abstract logout(): void;
  abstract updateProfile(data: Partial<User>): void;
}
