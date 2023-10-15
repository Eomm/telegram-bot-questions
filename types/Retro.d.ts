/**
 * Retro
 * A Retro
 */
declare interface Retro {
    id?: number;
    code?: string | null;
    createdAt?: string | null;
    createdBy?: string | null;
    cron: string;
    googleSheetId: string;
    name: string;
    questions?: string | null;
    updatedAt?: string | null;
}
export { Retro };
