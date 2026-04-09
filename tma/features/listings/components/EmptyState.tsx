interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className="rounded-3xl bg-gray-900 p-6 text-center text-gray-400">{message}</div>;
}
