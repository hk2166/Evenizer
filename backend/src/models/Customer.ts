import { UserRole } from "./enum";
import { User } from "./User";

export class Customer extends User {
  constructor(id: string, name: string, email: string, password: string) {
    super(id, name, email, password, UserRole.CUSTOMER);
  }

  login(): Promise<boolean> {
    // Implement customer login logic
    return Promise.resolve(true);
  }

  logout(): void {
    // Implement logout logic
  }

  updateProfile(data: Partial<User>): void {
    // Implement profile update logic
  }

  browseEvent(): void {
    // Customer-specific logic
  }

  bookTicket(): void {
    // Customer-specific logic
  }

  cancelTicket(): void {
    // Customer-specific logic
  }

  viewTicketHistory(): void {
    // Customer-specific logic
  }
}
