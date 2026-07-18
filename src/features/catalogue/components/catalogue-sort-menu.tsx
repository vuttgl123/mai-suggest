import type { ReactElement } from "react";
import { FieldLabel, SelectControl } from "@/components/ui/form-control";
import type { CatalogueSort } from "@/features/catalogue/lib/catalogue-query";

interface CatalogueSortMenuProps {
  value: CatalogueSort;
  onChange(value: CatalogueSort): void;
}

export function CatalogueSortMenu({
  value,
  onChange,
}: CatalogueSortMenuProps): ReactElement {
  return (
    <div className="min-w-44 space-y-1.5">
      <FieldLabel htmlFor="catalogue-sort">Sắp xếp</FieldLabel>
      <SelectControl
        id="catalogue-sort"
        name="catalogue-sort"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value as CatalogueSort)}
      >
        <option value="recommended">Đề xuất trước</option>
        <option value="price-ascending">Ngân sách thấp trước</option>
        <option value="price-descending">Ngân sách cao trước</option>
        <option value="name">Tên A-Z</option>
      </SelectControl>
    </div>
  );
}
