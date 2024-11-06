export interface Message {
    role: 'ai' | 'user';
    content: string;
    agent?: string;
    autonomy_level?: number;
}
