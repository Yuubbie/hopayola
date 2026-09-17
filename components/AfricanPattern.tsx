type Props = {
  className?: string;
  color?: string;
};

/**
 * A repeating geometric pattern inspired by Ankara / Adire textile motifs.
 * Pure SVG, no external images - safe, fast, and on-brand.
 */
export default function AfricanPattern({
  className = "",
  color = "#5B2A86",
}: Props) {
  const id = "ankara-pattern";

  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width="56"
          height="56"
          patternUnits="userSpaceOnUse"
        >
          <rect width="56" height="56" fill="none" />
          <path
            d="M28 4 L48 28 L28 52 L8 28 Z"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            opacity="0.35"
          />
          <circle cx="28" cy="28" r="4" fill={color} opacity="0.25" />
          <path
            d="M0 28 L28 0 M28 56 L56 28"
            stroke={color}
            strokeWidth="1"
            opacity="0.15"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}