"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  BRANDS,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  PROCESSOR_OPTIONS,
  PRICE_RANGES,
  SORT_OPTIONS,
  USE_CASES,
} from "@/lib/constants";

function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (updater: (params: URLSearchParams) => URLSearchParams) => {
      const next = updater(new URLSearchParams(searchParams.toString()));
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return { searchParams, setParams };
}

export function FilterPanel() {
  const { searchParams, setParams } = useFilters();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearch = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const q = value.trim();
      setParams((p) => {
        if (q) p.set("q", q);
        else p.delete("q");
        return p;
      });
    }, 300);
  };

  const val = (key: string) => searchParams.get(key) ?? "";
  const hasActiveFilters =
    [...searchParams.keys()].filter((k) => k !== "sort" && k !== "q").length > 0 ||
    !!val("q");

  const toggle = (key: string, value: string) => {
    const current = val(key);
    setParams((p) => {
      if (current === value) p.delete(key);
      else p.set(key, value);
      return p;
    });
  };

  const clearAll = () =>
    setParams((p) => {
      p.delete("brand");
      p.delete("ram");
      p.delete("storage");
      p.delete("processor");
      p.delete("price");
      p.delete("use_case");
      p.delete("q");
      return p;
    });

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          defaultValue={val("q")}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search laptops..."
          className="input-lestic pl-9"
        />
      </div>

      <FilterField label="Price">
        {PRICE_RANGES.map((range) => (
          <FilterCheck
            key={range.value}
            checked={val("price") === range.value}
            onChange={() => toggle("price", range.value)}
            label={range.label}
          />
        ))}
      </FilterField>

      <FilterField label="Brand">
        {BRANDS.map((brand) => (
          <FilterCheck
            key={brand}
            checked={val("brand") === brand}
            onChange={() => toggle("brand", brand)}
            label={brand}
          />
        ))}
      </FilterField>

      <FilterField label="Use Case">
        {USE_CASES.map((uc) => (
          <FilterCheck
            key={uc.value}
            checked={val("use_case") === uc.value}
            onChange={() => toggle("use_case", uc.value)}
            label={uc.label}
          />
        ))}
      </FilterField>

      <FilterField label="RAM">
        {RAM_OPTIONS.map((ram) => (
          <FilterCheck
            key={ram}
            checked={val("ram") === ram}
            onChange={() => toggle("ram", ram)}
            label={ram}
          />
        ))}
      </FilterField>

      <FilterField label="Storage">
        {STORAGE_OPTIONS.map((s) => (
          <FilterCheck
            key={s}
            checked={val("storage") === s}
            onChange={() => toggle("storage", s)}
            label={s}
          />
        ))}
      </FilterField>

      <FilterField label="Processor">
        {PROCESSOR_OPTIONS.map((p) => (
          <FilterCheck
            key={p}
            checked={val("processor") === p}
            onChange={() => toggle("processor", p)}
            label={p}
          />
        ))}
      </FilterField>
    </aside>
  );
}

export function SortSelect() {
  const { searchParams, setParams } = useFilters();
  return (
    <select
      value={searchParams.get("sort") ?? "newest"}
      onChange={(e) =>
        setParams((p) => {
          if (e.target.value === "newest") p.delete("sort");
          else p.set("sort", e.target.value);
          return p;
        })
      }
      className="input-lestic w-auto"
      aria-label="Sort laptops"
    >
      {SORT_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          Sort: {s.label}
        </option>
      ))}
    </select>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 py-4 last:border-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterCheck({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <span className="flex-1">{label}</span>
      {typeof count === "number" && (
        <span className="text-xs text-slate-400">{count}</span>
      )}
    </label>
  );
}
