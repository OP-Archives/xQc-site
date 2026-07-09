import { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface CustomLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  children: ReactNode;
  color?: string;
  href?: string;
}

export default function CustomLink({ children, className = '', href, ...props }: CustomLinkProps) {
  const isExternal = href?.startsWith('http') || href?.startsWith('mailto:');

  if (isExternal || !href) {
    return (
      <a
        href={href}
        className={`hover:opacity-50 transition-opacity ${className}`}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className={`hover:opacity-50 transition-opacity ${className}`} {...props}>
      {children}
    </Link>
  );
}
