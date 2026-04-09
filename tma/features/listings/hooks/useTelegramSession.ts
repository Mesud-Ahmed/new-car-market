'use client';

import { useEffect, useState } from 'react';
import { ADMIN_USER_ID } from '../constants';
import type { ActiveTab } from '../types';

interface TelegramSessionState {
  activeTab: ActiveTab;
  isAdmin: boolean;
  telegramUserId: number | null;
  setActiveTab: (tab: ActiveTab) => void;
}

type TelegramWebAppInstance = NonNullable<NonNullable<Window['Telegram']>['WebApp']>;

function coerceInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
}

function readTelegramUserId(webApp: TelegramWebAppInstance): number | null {
  const unsafeUserId = coerceInteger(webApp.initDataUnsafe?.user?.id);
  if (unsafeUserId !== null) {
    return unsafeUserId;
  }

  const initData = webApp.initData?.trim();
  if (!initData) {
    return null;
  }

  const params = new URLSearchParams(initData);
  const rawUser = params.get('user');
  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser) as { id?: unknown };
    return coerceInteger(parsedUser.id);
  } catch {
    return null;
  }
}

function readTelegramUserIdFromLaunchUrl(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const launchPayload = [window.location.search, window.location.hash]
    .map((part) => part.replace(/^[?#]/, ''))
    .join('&');

  if (!launchPayload) {
    return null;
  }

  const params = new URLSearchParams(launchPayload);
  const tgWebAppData = params.get('tgWebAppData');
  if (!tgWebAppData) {
    return null;
  }

  const dataParams = new URLSearchParams(tgWebAppData);
  const rawUser = dataParams.get('user');
  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser) as { id?: unknown };
    return coerceInteger(parsedUser.id);
  } catch {
    return null;
  }
}

export function useTelegramSession(): TelegramSessionState {
  const [activeTab, setActiveTab] = useState<ActiveTab>('buyer');
  const [isAdmin, setIsAdmin] = useState(false);
  const [telegramUserId, setTelegramUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let attempts = 0;
    let didInitWebApp = false;
    const maxAttempts = 40;
    // Telegram WebApp and user data can arrive shortly after first render.
    const intervalId = window.setInterval(() => {
      attempts += 1;
      const webApp = window.Telegram?.WebApp;

      if (!webApp) {
        if (attempts >= maxAttempts) {
          window.clearInterval(intervalId);
        }
        return;
      }

      if (!didInitWebApp) {
        webApp.ready();
        webApp.expand();
        webApp.setHeaderColor('#111827');
        didInitWebApp = true;
      }

      const userId = readTelegramUserId(webApp) ?? readTelegramUserIdFromLaunchUrl();

      if (userId !== null) {
        setTelegramUserId(userId);

        if (userId === ADMIN_USER_ID) {
          setIsAdmin(true);
          setActiveTab('admin');
        }

        window.clearInterval(intervalId);
      } else if (attempts >= maxAttempts) {
        window.clearInterval(intervalId);
      }
    }, 150);

    return () => window.clearInterval(intervalId);
  }, []);

  return { activeTab, isAdmin, telegramUserId, setActiveTab };
}
