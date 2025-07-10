import type { SVGProps } from "react"

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 10v4c0 .55.45 1 1 1h2.5c1.38 0 2.5-1.12 2.5-2.5S11.88 10 10.5 10H7z" />
      <path d="M14 10c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c1.38 0 2.5-1.12 2.5-2.5S15.38 10 14 10z" />
      <path d="M10.5 10V8c0-1.1.9-2 2-2h0c1.1 0 2 .9 2 2v2" />
      <path d="M7 10V8c0-1.1.9-2 2-2h0" />
      <path d="M12 18v-2" />
    </svg>
  );
}
