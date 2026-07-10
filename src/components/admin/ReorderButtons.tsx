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
        className="ui-btn-ghost px-3 py-2 disabled:opacity-40"
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={disableDown}
        className="ui-btn-ghost px-3 py-2 disabled:opacity-40"
        aria-label="Move down"
      >
        ↓
      </button>
    </div>
  );
}