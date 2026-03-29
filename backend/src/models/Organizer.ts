import { User } from "./User";

export class Organizer extends User {
  constructor(id: string, name: string, email: string, password: string) {
    super(id, name, email, password, "organizer");
  }

  login(): Promise<boolean> {
    // Implement organizer login logic
    return Promise.resolve(true);
  }

  logout(): void {
    // Implement logout logic
  }

  updateProfile(data: Partial<User>): void {
    // Implement profile update logic
  }

  createEvent(): void {
    // Organizer-specific logic
  }

  updateEvent(): void {
    // Organizer-specific logic
  }

  viewBooking(): void {
    // Organizer-specific logic
  }
}
