import React, { HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'interactive';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** The content of the card */
  children: ReactNode;
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Card header content */
  header?: ReactNode;
  /** Card footer content */
  footer?: ReactNode;
  /** Whether the card has hover effects */
  hoverable?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Card title shown in the header */
  title?: string;
  /** Card subtitle shown in the header */
  subtitle?: string;
  /** Icon to display in the header */
  icon?: ReactNode;
  /** Whether to show a divider between header and content */
  headerDivider?: boolean;
  /** Whether to show a divider between content and footer */
  footerDivider?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  header,
  footer,
  hoverable = false,
  className = '',
  title,
  subtitle,
  icon,
  headerDivider = false,
  footerDivider = false,
  ...props
}) => {
  // Base classes
  const baseClasses = 'rounded overflow-hidden transition-all';
  
  // Variant classes
  const variantClasses = {
    default: 'bg-card-bg',
    outlined: 'bg-card-bg border border-card-border',
    elevated: 'bg-card-bg shadow-md',
    interactive: 'bg-card-bg border border-transparent hover:border-card-border cursor-pointer'
  };
  
  // Hover effect
  const hoverClasses = hoverable ? 'hover:shadow-lg' : '';
  
  // Determine if we should render the built-in header
  const hasBuiltInHeader = title || subtitle || icon;
  
  // Create a header if title, subtitle, or icon is provided but no custom header
  const cardHeader = header || (hasBuiltInHeader ? (
    <div className="flex items-center p-4">
      {icon && <div className="mr-3">{icon}</div>}
      <div>
        {title && <h3 className="font-medium text-text-primary">{title}</h3>}
        {subtitle && <div className="text-sm text-text-secondary mt-1">{subtitle}</div>}
      </div>
    </div>
  ) : null);
  
  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${hoverClasses}
        ${className}
      `}
      {...props}
    >
      {/* Header */}
      {cardHeader && (
        <>
          {cardHeader}
          {headerDivider && <div className="h-px bg-card-border" />}
        </>
      )}
      
      {/* Content */}
      <div className={`${!cardHeader ? 'p-4' : 'px-4 py-3'}`}>
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <>
          {footerDivider && <div className="h-px bg-card-border" />}
          <div className="p-4 bg-carbon-50 dark:bg-carbon-800">
            {footer}
          </div>
        </>
      )}
    </div>
  );
};

export default Card; 