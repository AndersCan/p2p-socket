import graceful_goodbye from "graceful-goodbye";

type Unregister = () => void & { exit: () => void };
export function goodbye(fn: () => void, index?: number): Unregister {
  return graceful_goodbye(fn, index);
}
