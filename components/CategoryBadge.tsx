import { Category } from "@/types";
import { Wheat, Pill } from "lucide-react";

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
}

export default function CategoryBadge({ category, size = "md" }: CategoryBadgeProps) {
  const isRation = category === "Ration";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        isRation
          ? "bg-green-100 text-green-700"
          : "bg-blue-100 text-blue-700"
      } ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"}`}
    >
      {isRation ? (
        <Wheat className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      ) : (
        <Pill className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      )}
      {category}
    </span>
  );
}
