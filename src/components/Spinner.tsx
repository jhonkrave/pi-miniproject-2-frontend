import { SpinnerIcon } from './Icons';

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
    <span aria-hidden style={{ color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <SpinnerIcon size={size} />
    </span>
  );
}


