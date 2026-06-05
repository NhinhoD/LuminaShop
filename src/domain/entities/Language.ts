export interface Language {
  id?: string;
  code: string; // e.g., 'en', 'vi'
  name: string; // e.g., 'English', 'Tiếng Việt'
  isActive: boolean;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}
