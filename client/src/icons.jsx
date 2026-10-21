// Small stroke icons, 16px, colored by the surrounding text.
const Svg = ({ children, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const Plus = () => <Svg><path d="M8 3v10M3 8h10" /></Svg>;
export const X = () => <Svg size={18}><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></Svg>;
export const Search = () => <Svg><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></Svg>;
export const Chevron = () => <Svg><path d="M4 6l4 4 4-4" /></Svg>;
