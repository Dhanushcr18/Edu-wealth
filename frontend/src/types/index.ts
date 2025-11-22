export interface User {
  id: string;
  name: string;
  email: string;
  budgetAmount?: number | null;
  currency?: string;
  createdAt: string;
  interests?: Interest[];
}

export interface Interest {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  providerName: string;
  providerSlug: string;
  url: string;
  price: number | null;
  currency?: string | null;
  rating: number | null;
  duration?: string | null;
  categories?: string[];
  thumbnailUrl?: string | null;
  description?: string | null;
  scrapedAt: string;
  savedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CoursesResponse {
  courses: Course[];
  total: number;
  limit: number;
  offset: number;
  motivationalMessage?: string;
}
