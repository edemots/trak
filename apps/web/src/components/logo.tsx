import { cn } from "@/lib/utils";

export default function Logo({
  size = 64,
  className,
  ...props
}: React.ComponentProps<"div"> & { size?: number }) {
  return (
    <div
      className={cn(
        "relative grid size-(--size) place-items-center overflow-hidden shadow-xl",
        className,
      )}
      style={
        {
          "--size": `${size}px`,
          "--border-size": `${size! * 0.375}px`,
        } as React.CSSProperties
      }
      {...props}
    >
      <span className="bg-primary/20 absolute inset-0 block backdrop-blur-xs" />
      <span className="border-l-primary/80! block origin-center translate-x-1/3 translate-y-1/3 rotate-45 border-(length:--border-size) border-transparent" />
    </div>
  );
}
