import { Popover, PopoverContent, PopoverTrigger } from ".";

type PropsType = {
  title: string;
  description: string;
  triggerLabel: string;
  position: "top" | "right" | "bottom" | "left";
};

export function PopoverOne({
  title,
  description,
  triggerLabel,
  position,
}: PropsType) {
  return (
    <Popover>
      <PopoverTrigger>{triggerLabel}</PopoverTrigger>

      <PopoverContent position={position}>
        <h4 className="border-b border-stroke p-3 text-center text-xl font-semibold text-dark dark:border-dark-3 dark:text-white">
          {title}
        </h4>

        <div className="px-5 py-4.5 text-center">
          <p className="font-medium">{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
