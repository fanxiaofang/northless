import type { SVGProps } from 'react';

type NorthlessMarkProps = SVGProps<SVGSVGElement> & {
  micro?: boolean;
};

/** An open bearing ring and a separate, rising drift path. */
export function NorthlessMark({ micro = false, ...props }: NorthlessMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M13.1 4 C7.9 2.9 3 6.1 2.7 11 C2.4 15.8 6.3 19.6 11.4 20.1 C16.4 20.6 20.3 18.1 20.4 14"
        strokeWidth={micro ? 2.25 : 1.8}
      />
      <path
        d={micro
          ? 'M6.9 16.3 C11.4 15.8 16.4 11.2 21 6.1'
          : 'M5.6 16.8 C10.8 16.1 16.2 11.3 21.7 5.4'}
        strokeWidth={micro ? 1.75 : 1.4}
      />
    </svg>
  );
}
