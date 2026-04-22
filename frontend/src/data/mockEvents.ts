import type { Event } from "../types";

export interface MockEvent extends Event {
  category: string;
  imageGradient: string;
  tags: string[];
  popularity: number;
}

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: "evt-001",
    title: "Neon Nights Electronic Festival",
    description:
      "Three stages, 40+ artists, and an immersive light show experience. Featuring top DJs from Berlin, Amsterdam, and Tokyo. Camping available on-site.",
    location: "Brookside Arena, Mumbai",
    date: "2026-08-15T20:00:00",
    status: "published",
    organizerId: "org-1",
    category: "music",
    imageGradient: "from-purple-600 to-indigo-800",
    tags: ["Electronic", "Festival", "Outdoor"],
    popularity: 98,
    ticketCategories: [
      { _id: "tc-001-1", title: "Early Bird", price: 999, type: "early_bird", totalSeats: 200, availableSeats: 0, reservedSeats: 200, eventId: "evt-001" },
      { _id: "tc-001-2", title: "General Admission", price: 1499, type: "regular", totalSeats: 1000, availableSeats: 142, reservedSeats: 50, eventId: "evt-001" },
      { _id: "tc-001-3", title: "VIP Lounge", price: 3999, type: "vip", totalSeats: 100, availableSeats: 23, reservedSeats: 5, eventId: "evt-001" },
    ],
  },
  {
    id: "evt-002",
    title: "FutureTech Summit 2026",
    description:
      "India's largest technology conference. Keynotes from founders of unicorn startups, hands-on AI workshops, and a startup pitch competition with ₹50L prize pool.",
    location: "Jio World Convention Centre, Mumbai",
    date: "2026-09-10T09:00:00",
    status: "published",
    organizerId: "org-2",
    category: "tech",
    imageGradient: "from-cyan-500 to-blue-700",
    tags: ["AI", "Startups", "Networking"],
    popularity: 91,
    ticketCategories: [
      { _id: "tc-002-1", title: "Standard Pass", price: 2999, type: "regular", totalSeats: 500, availableSeats: 312, reservedSeats: 20, eventId: "evt-002" },
      { _id: "tc-002-2", title: "Pro Pass", price: 5999, type: "premium", totalSeats: 200, availableSeats: 67, reservedSeats: 10, eventId: "evt-002" },
      { _id: "tc-002-3", title: "Enterprise Pass", price: 14999, type: "vip", totalSeats: 50, availableSeats: 8, reservedSeats: 2, eventId: "evt-002" },
    ],
  },
  {
    id: "evt-003",
    title: "Champions League Final Watch Party",
    description:
      "Watch the UEFA Champions League Final on a massive 40-foot screen with 5000 fellow fans. Includes unlimited snacks, beverages, and live commentary.",
    location: "DY Patil Stadium, Navi Mumbai",
    date: "2026-06-01T21:00:00",
    status: "published",
    organizerId: "org-3",
    category: "sports",
    imageGradient: "from-green-500 to-emerald-700",
    tags: ["Football", "Live Screening", "Sports Bar"],
    popularity: 87,
    ticketCategories: [
      { _id: "tc-003-1", title: "General Stand", price: 499, type: "regular", totalSeats: 3000, availableSeats: 1240, reservedSeats: 300, eventId: "evt-003" },
      { _id: "tc-003-2", title: "Premium Lounge", price: 1299, type: "premium", totalSeats: 500, availableSeats: 89, reservedSeats: 40, eventId: "evt-003" },
    ],
  },
  {
    id: "evt-004",
    title: "Zakir Hussain — Tabla Maestro",
    description:
      "An intimate evening with the legendary tabla maestro Zakir Hussain. A rare solo performance celebrating 50 years of his musical journey.",
    location: "NCPA, Mumbai",
    date: "2026-07-20T19:30:00",
    status: "published",
    organizerId: "org-4",
    category: "arts",
    imageGradient: "from-amber-500 to-orange-700",
    tags: ["Classical", "Tabla", "Live Music"],
    popularity: 95,
    ticketCategories: [
      { _id: "tc-004-1", title: "Balcony", price: 1500, type: "regular", totalSeats: 300, availableSeats: 45, reservedSeats: 20, eventId: "evt-004" },
      { _id: "tc-004-2", title: "Orchestra", price: 3500, type: "premium", totalSeats: 200, availableSeats: 12, reservedSeats: 8, eventId: "evt-004" },
      { _id: "tc-004-3", title: "Front Row", price: 7500, type: "vip", totalSeats: 50, availableSeats: 3, reservedSeats: 2, eventId: "evt-004" },
    ],
  },
  {
    id: "evt-005",
    title: "Stand-Up Spectacular: Vir Das Live",
    description:
      "Vir Das returns to Mumbai with his brand-new Netflix special warm-up tour. Two hours of unfiltered comedy. 18+ only.",
    location: "St. Andrews Auditorium, Bandra",
    date: "2026-08-05T20:00:00",
    status: "published",
    organizerId: "org-5",
    category: "comedy",
    imageGradient: "from-yellow-400 to-red-500",
    tags: ["Stand-Up", "Comedy", "18+"],
    popularity: 93,
    ticketCategories: [
      { _id: "tc-005-1", title: "General", price: 799, type: "regular", totalSeats: 600, availableSeats: 234, reservedSeats: 60, eventId: "evt-005" },
      { _id: "tc-005-2", title: "Premium", price: 1499, type: "premium", totalSeats: 200, availableSeats: 56, reservedSeats: 15, eventId: "evt-005" },
    ],
  },
  {
    id: "evt-006",
    title: "Coldplay: Music of the Spheres World Tour",
    description:
      "Coldplay's record-breaking world tour comes to India. An eco-friendly concert experience with LED wristbands, sustainable staging, and surprise guests.",
    location: "Narendra Modi Stadium, Ahmedabad",
    date: "2026-11-22T18:00:00",
    status: "published",
    organizerId: "org-6",
    category: "music",
    imageGradient: "from-pink-500 to-violet-700",
    tags: ["Pop Rock", "Stadium", "International"],
    popularity: 100,
    ticketCategories: [
      { _id: "tc-006-1", title: "Silver", price: 3500, type: "regular", totalSeats: 40000, availableSeats: 8200, reservedSeats: 2000, eventId: "evt-006" },
      { _id: "tc-006-2", title: "Gold", price: 7500, type: "premium", totalSeats: 10000, availableSeats: 1100, reservedSeats: 400, eventId: "evt-006" },
      { _id: "tc-006-3", title: "Platinum Floor", price: 15000, type: "vip", totalSeats: 2000, availableSeats: 89, reservedSeats: 50, eventId: "evt-006" },
    ],
  },
];

export const MOCK_BOOKINGS = [
  {
    _id: "bk-001",
    customerId: "user-1",
    eventId: MOCK_EVENTS[0],
    ticketCategoryId: MOCK_EVENTS[0].ticketCategories![1],
    quantity: 2,
    totalAmount: 2998,
    status: "confirmed" as const,
    reservedAt: "2026-05-10T14:30:00",
    expiresAt: "2026-05-10T14:45:00",
    confirmedAt: "2026-05-10T14:32:00",
  },
  {
    _id: "bk-002",
    customerId: "user-1",
    eventId: MOCK_EVENTS[1],
    ticketCategoryId: MOCK_EVENTS[1].ticketCategories![0],
    quantity: 1,
    totalAmount: 2999,
    status: "reserved" as const,
    reservedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  },
  {
    _id: "bk-003",
    customerId: "user-1",
    eventId: MOCK_EVENTS[3],
    ticketCategoryId: MOCK_EVENTS[3].ticketCategories![0],
    quantity: 3,
    totalAmount: 4500,
    status: "cancelled" as const,
    reservedAt: "2026-04-20T10:00:00",
    expiresAt: "2026-04-20T10:15:00",
    cancelledAt: "2026-04-20T10:05:00",
  },
  {
    _id: "bk-004",
    customerId: "user-1",
    eventId: MOCK_EVENTS[5],
    ticketCategoryId: MOCK_EVENTS[5].ticketCategories![1],
    quantity: 2,
    totalAmount: 15000,
    status: "confirmed" as const,
    reservedAt: "2026-05-01T09:00:00",
    expiresAt: "2026-05-01T09:15:00",
    confirmedAt: "2026-05-01T09:03:00",
  },
];
