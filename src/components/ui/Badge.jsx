export default function Badge({ children, variant = 'info' }) {
  const variants = {
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    danger: 'badge badge-danger',
    info: 'badge badge-info',
  };

  return <span className={variants[variant] || variants.info}>{children}</span>;
}
