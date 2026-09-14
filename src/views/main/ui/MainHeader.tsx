import Image from "next/image";
import Link from "next/link";

export function MainHeader() {
  return (
    <header className="flex h-14 w-full items-center border-b border-border bg-background-section px-md">
      <Link
        href="/menu"
        aria-label="메뉴 열기"
        className="inline-flex size-11 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Image src="/assets/menu.svg" alt="" width={24} height={24} />
      </Link>
    </header>
  );
}
