// API and WebSocket configuration
const API_BASE_URL = 'http://localhost:8000';
const WS_BASE_URL = 'ws://localhost:8000';

export const config = {
    API_BASE_URL,
    WS_BASE_URL,
    endpoints: {
        consult: `${API_BASE_URL}/consult`,
        progressReport: `${API_BASE_URL}/progress_report`,
        explainStrategy: `${API_BASE_URL}/explain_strategy`,
        websocket: (workspaceId: string) => `${WS_BASE_URL}/ws/${workspaceId}`
    }
};

export default config;
