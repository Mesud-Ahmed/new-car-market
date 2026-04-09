interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <p className="rounded-2xl border border-red-700 bg-red-900/50 px-4 py-3 text-sm text-red-100">{message}</p>
    </div>
  );
}
