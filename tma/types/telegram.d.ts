export {};

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        // Add more properties if you use them later (initData, etc.)
      };
    };
  }
}