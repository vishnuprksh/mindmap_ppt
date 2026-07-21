import type { LucideIcon } from "lucide-react";

type IconButtonProps = {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
};

export function IconButton({ icon: Icon, label, shortcut, disabled, active, onClick }: IconButtonProps) {
  const title = shortcut ? `${label} (${shortcut})` : label;
  return (
    <button className="icon-button" type="button" aria-label={label} title={title} disabled={disabled} data-active={active || undefined} onClick={onClick}>
      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
    </button>
  );
}
