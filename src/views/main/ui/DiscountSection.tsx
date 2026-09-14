import Image from "next/image";

import { cn } from "@/shared/lib/cn";
import { Checkbox } from "@/shared/ui";

export interface DiscountCategory {
  id: string;
  label: string;
}

interface DiscountSectionProps {
  categories: DiscountCategory[];
  members: string[];
  selections: Record<string, Set<string>>;
  onSelectionsChange: (selections: Record<string, Set<string>>) => void;
}

const checkIcon = <Image src="/assets/check.svg" alt="" width={14} height={14} />;

export function DiscountSection({ categories, members, onSelectionsChange, selections }: DiscountSectionProps) {
  function toggleMember(categoryId: string, member: string, checked: boolean) {
    const categorySelection = new Set(selections[categoryId]);

    if (checked) categorySelection.add(member);
    else categorySelection.delete(member);

    onSelectionsChange({ ...selections, [categoryId]: categorySelection });
  }

  return (
    <section className="rounded-md border border-border bg-background-section p-lg">
      <h2 className="mb-lg text-heading">회비 할인 기록</h2>
      <div className="flex flex-col gap-lg">
        {categories.map((category) => (
          <div key={category.id} className="min-w-0">
            <div className="mb-sm flex items-center justify-between">
              <h3 className="text-emphasis text-text-secondary">{category.label}</h3>
            </div>
            <div className="flex gap-sm overflow-x-auto pb-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {members.map((member) => {
                const checked = selections[category.id]?.has(member) ?? false;

                return (
                  <Checkbox
                    key={member}
                    checked={checked}
                    checkedIcon={checkIcon}
                    label={member}
                    className={cn(
                      "shrink-0 rounded-sm border bg-background-interactive px-md py-sm text-body",
                      checked ? "border-primary text-text-primary" : "border-border text-text-secondary",
                    )}
                    onCheckedChange={(nextChecked) => toggleMember(category.id, member, nextChecked)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
