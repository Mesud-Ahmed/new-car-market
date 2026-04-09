import { Phone } from 'lucide-react';

interface CallDealerButtonProps {
  onClick: () => void;
}

export function CallDealerButton({ onClick }: CallDealerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 font-semibold text-black transition-colors hover:bg-emerald-400"
    >
      <Phone className="h-6 w-6" />
      CALL DEALER
    </button>
  );
}
