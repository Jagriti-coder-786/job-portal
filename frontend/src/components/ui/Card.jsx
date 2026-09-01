export default function Card({ children, className = '', hover, onClick, ...props }) {
  return (
    <div
      className={`${hover ? 'card-hover cursor-pointer' : 'card'} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
