import Image from "next/image";

import { IconButton } from "@/shared/ui";

interface MainHeaderProps {
  onMenuClick?: () => void;
}

export function MainHeader({ onMenuClick }: MainHeaderProps) {
  return (
    <header className="flex h-14 w-full items-center border-b border-border bg-background-section px-md">
      <IconButton
        label="메뉴 열기"
        onClick={onMenuClick}
        icon={<Image src="/assets/menu.svg" alt="" width={24} height={24} />}
      />
    </header>
  );
}
