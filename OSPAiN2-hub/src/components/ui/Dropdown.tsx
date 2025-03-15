import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItemProps {
  id?: string;
  label: React.ReactNode;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  className?: string;
  isActive?: boolean;
  testId?: string;
}

export interface DropdownDividerProps {
  id?: string;
  type: 'divider';
  className?: string;
}

export interface DropdownSectionProps {
  id?: string;
  type: 'section';
  title: string;
  items: (DropdownItemProps | DropdownDividerProps | { id?: string; type: 'custom'; content: React.ReactNode; className?: string })[];
  className?: string;
}

export interface DropdownCustomItemProps {
  id?: string;
  type: 'custom';
  content: React.ReactNode;
  className?: string;
}

export type DropdownItemType = DropdownItemProps | DropdownDividerProps | DropdownSectionProps | DropdownCustomItemProps;

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItemType[];
  placement?: 'bottom-start' | 'bottom-end' | 'bottom' | 'top-start' | 'top-end' | 'top';
  className?: string;
  dropdownClassName?: string;
  triggerClassName?: string;
  width?: number | string;
  closeOnItemClick?: boolean;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  maxHeight?: number | string;
  onOutsideClick?: () => void;
  disabled?: boolean;
  testId?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  className = '',
  dropdownClassName = '',
  triggerClassName = '',
  width = 'auto',
  closeOnItemClick = true,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  maxHeight = 'auto',
  onOutsideClick,
  disabled = false,
  testId = 'dropdown',
}) => {
  // State for uncontrolled component
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? setControlledIsOpen : setInternalIsOpen;
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
        onOutsideClick?.();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen, onOutsideClick]);
  
  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onOutsideClick?.();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen, onOutsideClick]);
  
  // Toggle dropdown
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };
  
  // Handle item click
  const handleItemClick = (onClick?: () => void) => {
    return () => {
      if (onClick) {
        onClick();
      }
      
      if (closeOnItemClick) {
        setIsOpen(false);
      }
    };
  };

  // Get placement classes
  const getPlacementClasses = () => {
    switch (placement) {
      case 'bottom-start':
        return 'top-full left-0';
      case 'bottom-end':
        return 'top-full right-0';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2';
      case 'top-start':
        return 'bottom-full left-0';
      case 'top-end':
        return 'bottom-full right-0';
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2';
      default:
        return 'top-full left-0';
    }
  };

  // Render a regular dropdown item
  const renderItem = (item: DropdownItemProps, index: number) => {
    const { 
      id,
      label, 
      onClick, 
      href, 
      icon, 
      disabled = false, 
      variant = 'default',
      className = '',
      isActive = false,
      testId
    } = item;

    const variantClasses = {
      default: 'hover:bg-gray-100 focus:bg-gray-100 text-text-primary',
      danger: 'hover:bg-red-50 focus:bg-red-50 text-red-600',
      warning: 'hover:bg-yellow-50 focus:bg-yellow-50 text-yellow-600',
      success: 'hover:bg-green-50 focus:bg-green-50 text-green-600',
    };

    const baseClasses = 'flex w-full items-center px-4 py-2 text-sm transition-colors focus:outline-none';
    const activeClasses = isActive ? 'bg-gray-100' : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    if (href && !disabled) {
      return (
        <a
          key={index}
          href={href}
          className={`${baseClasses} ${variantClasses[variant]} ${activeClasses} ${disabledClasses} ${className}`}
          data-testid={testId || `${testId}-item-${index}`}
        >
          {icon && <span className="mr-2 flex items-center">{icon}</span>}
          {label}
        </a>
      );
    }

    return (
      <button
        key={index}
        type="button"
        onClick={disabled ? undefined : handleItemClick(onClick)}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${activeClasses} ${disabledClasses} ${className}`}
        data-testid={testId || `${testId}-item-${index}`}
      >
        {icon && <span className="mr-2 flex items-center">{icon}</span>}
        {label}
      </button>
    );
  };

  // Render a divider
  const renderDivider = (item: DropdownDividerProps, index: number) => {
    return (
      <div
        key={index}
        className={`my-1 h-px bg-gray-200 ${item.className || ''}`}
        role="separator"
      />
    );
  };

  // Render a section
  const renderSection = (section: DropdownSectionProps, sectionIndex: number) => {
    return (
      <div key={sectionIndex} className={`px-3 py-2 ${section.className || ''}`}>
        <h3 className="mb-1 px-1 text-xs font-semibold uppercase text-gray-500">
          {section.title}
        </h3>
        <div>
          {section.items.map((item, itemIndex) => {
            if ((item as DropdownDividerProps).type === 'divider') {
              return renderDivider(item as DropdownDividerProps, `${sectionIndex}-${itemIndex}`);
            } else if ((item as DropdownCustomItemProps).type === 'custom') {
              return renderCustomItem(item as DropdownCustomItemProps, `${sectionIndex}-${itemIndex}`);
            } else {
              return renderItem(item as DropdownItemProps, `${sectionIndex}-${itemIndex}`);
            }
          })}
        </div>
      </div>
    );
  };

  // Render custom content
  const renderCustomItem = (item: DropdownCustomItemProps, index: number) => {
    return (
      <div
        key={index}
        className={`px-3 py-2 ${item.className || ''}`}
      >
        {item.content}
      </div>
    );
  };

  // Render dropdown content
  const renderDropdownContent = () => {
    return (
      <div
        className={`absolute z-10 mt-1 rounded-md border border-gray-200 bg-white py-1 shadow-lg ${getPlacementClasses()} ${dropdownClassName}`}
        style={{ 
          width: typeof width === 'number' ? `${width}px` : width,
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          overflowY: maxHeight !== 'auto' ? 'auto' : undefined
        }}
        data-testid={`${testId}-content`}
      >
        {items.map((item, index) => {
          // Render based on item type
          if ((item as DropdownDividerProps).type === 'divider') {
            return renderDivider(item as DropdownDividerProps, index);
          } else if ((item as DropdownSectionProps).type === 'section') {
            return renderSection(item as DropdownSectionProps, index);
          } else if ((item as DropdownCustomItemProps).type === 'custom') {
            return renderCustomItem(item as DropdownCustomItemProps, index);
          } else {
            return renderItem(item as DropdownItemProps, index);
          }
        })}
      </div>
    );
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      ref={containerRef}
      data-testid={testId}
    >
      <div
        className={`inline-block ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${triggerClassName}`}
        onClick={handleToggle}
        data-testid={`${testId}-trigger`}
      >
        {trigger}
      </div>
      
      {isOpen && renderDropdownContent()}
    </div>
  );
};

export default Dropdown; 