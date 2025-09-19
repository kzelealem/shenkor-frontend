import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProgressChips } from "../ProgressChips";
import { SearchBar } from "@/components/SearchBar";
import type { Counts } from "../types";

export function AttendanceHeader({
  heading,
  title,
  badge,
  counts,
  unmarkedCount,
  query,
  onQueryChange,
  onBack,
}: {
  heading: string;
  title: string;
  badge: string;
  counts: Counts;
  unmarkedCount: number;
  query: string;
  onQueryChange: (q: string) => void;
  onBack: () => void;
}) {
  return (
    <PageHeader heading={heading} title={title} badge={badge} onBack={onBack}>
      <ProgressChips counts={counts} unmarkedCount={unmarkedCount} />
      <SearchBar query={query} onChange={onQueryChange} />
    </PageHeader>
  );
}
