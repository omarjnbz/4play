import { icons, type IconName } from "@/lib/icons";

type Props = { name: IconName; className?: string; label?: string };

export function Icon({ name, className = "size-5", label }: Props) {
  const icon = icons[name];
  return (
    <svg
      viewBox={icon.viewBox}
      className={className}
      fill="currentColor"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
