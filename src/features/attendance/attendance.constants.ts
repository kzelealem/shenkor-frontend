// attendance.constants.ts
import { CheckIcon, BellIcon, MinusIcon } from "@/components/Icon";

export const STATUS_META = {
  present: { label: "Present", color: "green", Icon: CheckIcon },
  notified: { label: "Notified", color: "amber", Icon: BellIcon },
  absent: { label: "Absent", color: "red", Icon: MinusIcon },
  unmarked: { label: "Unmarked", color: "gray", Icon: null },
} as const;
