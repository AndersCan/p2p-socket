import goodbye from "graceful-goodbye";

type Unregister = () => void & { exit: () => void };
export function goodbye(fn: () => void, index?: number): Unregister {
  return goodbye(fn, index);
}
