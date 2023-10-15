/**
 * User
 * A User
 */
declare interface User {
    id?: string;
    chatId: string;
    createdAt?: string | null;
    currentAction?: string | null;
    currentActionData?: string | null;
    fullName: string;
    lang: string;
    role: "creator" | "user";
    updatedAt?: string | null;
    username?: string | null;
}
export { User };
