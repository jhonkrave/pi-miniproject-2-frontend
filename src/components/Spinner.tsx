export default function Spinner({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <span
      aria-hidden
      className="spinner"
      style={{ width: size, height: size, borderColor: color, borderTopColor: 'transparent' }}
    />
  );
}


