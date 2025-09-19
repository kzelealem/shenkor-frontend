import { memo } from "react";
import type { Member } from "@/types";
import { MemberDirectoryRow } from "./MemberDirectoryRow";

export const MemberDirectoryList = memo(function MemberDirectoryList({
  members,
  onOpen,
}: {
  members: Member[];
  onOpen: (m: Member) => void;
}) {
  return (
    <>
      {members.map((m) => (
        <MemberDirectoryRow key={m.id} member={m} onOpen={() => onOpen(m)} />
      ))}
    </>
  );
});
