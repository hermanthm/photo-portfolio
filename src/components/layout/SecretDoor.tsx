"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

const REQUIRED_CLICKS = 5;
const WINDOW_MS = 2000;
const SINGLE_CLICK_DELAY_MS = 300;

export function SecretDoor({
  siteTitle,
  className,
}: {
  siteTitle: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const clickCount = useRef(0);
  const firstClickAt = useRef(0);
  const singleClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdmin = pathname.startsWith("/admin");

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (isAdmin) return;

    event.preventDefault();

    if (singleClickTimer.current) {
      clearTimeout(singleClickTimer.current);
      singleClickTimer.current = null;
    }

    const now = Date.now();

    if (clickCount.current === 0 || now - firstClickAt.current > WINDOW_MS) {
      clickCount.current = 1;
      firstClickAt.current = now;
    } else {
      clickCount.current += 1;
    }

    if (clickCount.current >= REQUIRED_CLICKS) {
      clickCount.current = 0;
      firstClickAt.current = 0;
      router.push("/admin/login");
      return;
    }

    singleClickTimer.current = setTimeout(() => {
      clickCount.current = 0;
      firstClickAt.current = 0;
      router.push("/");
    }, SINGLE_CLICK_DELAY_MS);
  }

  return (
    <Link href="/" className={className} onClick={handleClick}>
      {siteTitle}
    </Link>
  );
}