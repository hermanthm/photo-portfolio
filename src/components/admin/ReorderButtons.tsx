type ReorderButtonsProps = {
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableUp: boolean;
  disableDown: boolean;
};

export function ReorderButtons({
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
}: ReorderButtonsProps) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={disableUp}
        className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7] disabled:opacity-40"
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={disableDown}
        className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-[#A1A1A6] transition hover:text-[#F5F5F7] disabled:opacity-40"
        aria-label="Move down"
      >
        ↓
      </button>
    </div>
  );
}