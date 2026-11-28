"use client";

interface MarqueeProps {
  readonly items: readonly string[];
  readonly className?: string;
  readonly itemClassName?: string;
  readonly separator?: string;
}

/**
 * Single-row CSS marquee with a duplicated, aria-hidden copy for a seamless
 * loop. The animation pauses on hover and is disabled entirely for users who
 * prefer reduced motion (see `globals.css`).
 *
 * @param props - Items, wrapper/item classes and separator glyph.
 * @returns Overflow-hidden marquee row.
 */
export function Marquee({
  items,
  className,
  itemClassName,
  separator = "·",
}: MarqueeProps): React.JSX.Element {
  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className={`flex shrink-0 items-center ${itemClassName ?? ""}`}>
          <span className="whitespace-nowrap">{item}</span>
          <span aria-hidden="true" className="mx-5 opacity-50 sm:mx-7">
            {separator}
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <div className="flex w-max animate-marquee">
        {row}
        <span aria-hidden="true" className="flex shrink-0 items-center">
          {row}
        </span>
      </div>
    </div>
  );
}
