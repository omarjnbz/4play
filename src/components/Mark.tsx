// The 4PLAY brand mark: the triangle-and-eye from the "A" of the logo.
// Authored as a simple geometric mark so it can be drawn, masked and patterned.

type Props = {
  className?: string;
  strokeWidth?: number;
  title?: string;
};

export const TRIANGLE_PATH = "M50 5 L95 83 L5 83 Z";
export const EYE_PATH = "M28 60 Q50 42 72 60 Q50 78 28 60 Z";

export function Mark({ className, strokeWidth = 6, title }: Props) {
  return (
    <svg
      viewBox="0 0 100 88"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d={TRIANGLE_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        data-mark-tri
      />
      <g data-mark-eye style={{ transformOrigin: "50px 60px" }}>
        <path d={`${EYE_PATH} M50 54.5 a5.5 5.5 0 1 0 0.01 0 Z`} fill="currentColor" fillRule="evenodd" />
      </g>
    </svg>
  );
}
