export type UserRole = "super" | "normal" | "guest";
const is = (userRole: unknown): userRole is UserRole => {
    return userRole === "super" || userRole === "normal" || userRole === "guest";
};
export const UserRole = {
    is,
};
