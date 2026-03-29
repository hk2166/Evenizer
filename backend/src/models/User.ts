// Abstract User class
export abstract class User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;

  constructor(
    id: string,
    name: string,
    email: string,
    password: string,
    role: string,
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
