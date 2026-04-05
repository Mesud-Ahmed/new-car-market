interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      username?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

export {};