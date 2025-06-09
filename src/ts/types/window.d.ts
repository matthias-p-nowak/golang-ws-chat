export { };

declare global {
    interface Window {
        wsURL: string;
        addInfo: (message: string) => void;
        addError: (message: string) => void;
        ws: WebSocket;
    }
}