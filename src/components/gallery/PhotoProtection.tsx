"use client";

import type { ClipboardEvent, DragEvent, MouseEvent, ReactNode } from "react";

type PhotoProtectionProps = {
  enabled?: boolean;
  className?: string;
  children: ReactNode;
};

function blockEvent(event: MouseEvent | ClipboardEvent | DragEvent) {
  event.preventDefault();
}

export function PhotoProtection({
  enabled = false,
  className = "",
  children,
}: PhotoProtectionProps) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative select-none [&_img]:pointer-events-none [&_img]:[-webkit-user-drag:none] ${className}`.trim()}
      onContextMenu={blockEvent}
      onCopy={blockEvent}
      onCut={blockEvent}
      onDragStart={blockEvent}
    >
      {children}
      <div
        className="absolute inset-0 z-10"
        aria-hidden="true"
        onContextMenu={blockEvent}
        onDragStart={blockEvent}
      />
    </div>
  );
}