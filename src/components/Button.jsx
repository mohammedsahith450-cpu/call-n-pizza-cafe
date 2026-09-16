import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  href,
  target,
  className = '',
  disabled = false,
  type = 'button',
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();

  if (href) {
    return (
      <a href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} className={classes}>
        {icon && <span className="btn__icon">{icon}</span>}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {icon && <span className="btn__icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
