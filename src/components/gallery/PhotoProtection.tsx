"use client";

import type { ClipboardEvent, MouseEvent, ReactNode } from "react";

type PhotoProtectionProps = {
  enabled?: boolean;
  className?: string;
  children: ReactNode;
};

function blockEvent(event: MouseEvent | ClipboardEvent) {
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
      className={className || undefined}
      onContextMenu={blockEvent}
      onCopy={blockEvent}
      onCut={blockEvent}
    >
      {children}
    </div>
  );
}