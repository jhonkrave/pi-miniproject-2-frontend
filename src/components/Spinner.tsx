/**
 * Spinner component for LumiFlix - mini project 2
 * 
 * This component is used to render a spinner.
 * 
 * @component
 * @returns {JSX.Element} The Spinner component with the spinner
 * 
 * @since 1.0.0
 */
export default function Spinner({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <span
      aria-hidden
      className="spinner"
      style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }}
    />
  );
}


