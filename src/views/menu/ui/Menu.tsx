"use client";

import Image from "next/image";
import Link from "next/link";

const menuItems = [
  { label: "회원 유형 관리", icon: "user-square", href: "/member-types" },
  { label: "회원 목록 관리", icon: "users", href: "/members" },
  { label: "할인 유형 관리", icon: "ticket-percent", href: "/discount-types" },
] as const;

export default function Menu() {
  return (
    <main className="flex min-h-dvh min-w-(--layout-content-min-width) flex-col bg-background-page text-text-primary">
      <header className="flex h-14 items-center px-xl">
        <Link href="/" aria-label="뒤로 가기" className="inline-flex size-8 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <Image src="/assets/page-chevron-left.svg" alt="" width={24} height={24} />
        </Link>
      </header>

      <nav className="flex flex-col gap-sm px-xl" aria-label="관리 메뉴">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-background-component p-lg text-left"
          >
            <span className="flex items-center gap-md text-emphasis">
              <Image src={`/assets/${item.icon}.svg`} alt="" width={22} height={22} />
              {item.label}
            </span>
            <Image src="/assets/menu-chevron-right.svg" alt="" width={16} height={16} />
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-xl pb-xl">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-md rounded-md border-strong border-primary bg-primary/15 p-lg text-action text-primary"
        >
          <Image src="/assets/file-image.svg" alt="" width={20} height={20} />
          회비 납부 이미지 생성
        </button>
      </div>
    </main>
  );
}
