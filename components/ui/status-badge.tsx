import { Badge } from "./badge";
import { TASK_STATUS, type TaskStatus, type TaskPriority } from "@/lib/constants";

const STATUS_LABEL: Record<TaskStatus, string> = {
  [TASK_STATUS.PENDING]: "Pending",
  [TASK_STATUS.IN_PROGRESS]: "In progress",
  [TASK_STATUS.COMPLETED]: "Completed",
};

const STATUS_VARIANT: Record<TaskStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  [TASK_STATUS.PENDING]: "muted",
  [TASK_STATUS.IN_PROGRESS]: "warning",
  [TASK_STATUS.COMPLETED]: "success",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}

const PRIORITY_VARIANT: Record<TaskPriority, React.ComponentProps<typeof Badge>["variant"]> = {
  low: "muted",
  medium: "secondary",
  high: "destructive",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]} className="capitalize">
      {priority}
    </Badge>
  );
}
