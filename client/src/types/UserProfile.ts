// Define the UserRole type for clarity and type safety
export type UserRole = 'user' | 'admin';

// Define the NotificationSettings type
export interface NotificationSettings {
    email: boolean;
    push: boolean;
}

// Define the core UserProfile type
export interface UserProfile {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
    // NEW: Add the nested notification settings object
    notificationSettings: NotificationSettings;
}

// Optional: Define a type for partial updates if needed
export type UserProfileUpdate = Partial<UserProfile>;