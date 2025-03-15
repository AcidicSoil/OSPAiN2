import React, { useState, useEffect } from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export type TabVariant = 'default' | 'underlined' | 'bordered' | 'pills';
export type TabOrientation = 'horizontal' | 'vertical';
export type TabAlignment = 'start' | 'center' | 'end' | 'stretch';

export interface TabsProps {
  items: TabItem[];
  variant?: TabVariant;
  orientation?: TabOrientation;
  alignment?: TabAlignment;
  defaultActiveTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
  tabClassName?: string;
  disableRipple?: boolean;
  testId?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  variant = 'default',
  orientation = 'horizontal',
  alignment = 'start',
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onChange,
  className = '',
  tabsClassName = '',
  contentClassName = '',
  tabClassName = '',
  disableRipple = false,
  testId = 'tabs',
}) => {
  // State for uncontrolled component
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    defaultActiveTab || (items.length > 0 ? items[0].id : '')
  );

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledActiveTab !== undefined;
  const activeTabId = isControlled ? controlledActiveTab : internalActiveTab;

  // Update internal state if controlled tab changes
  useEffect(() => {
    if (isControlled && controlledActiveTab) {
      setInternalActiveTab(controlledActiveTab);
    }
  }, [isControlled, controlledActiveTab]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (!isControlled) {
      setInternalActiveTab(tabId);
    }
    
    if (onChange) {
      onChange(tabId);
    }
  };

  // Get the active tab content
  const activeTabContent = items.find(item => item.id === activeTabId)?.content;

  // Variant-specific tab classes
  const getTabVariantClasses = (isActive: boolean, isDisabled: boolean) => {
    if (isDisabled) {
      return 'cursor-not-allowed opacity-50';
    }

    const baseClasses = 'cursor-pointer transition-all duration-200';
    
    switch (variant) {
      case 'underlined':
        return `${baseClasses} border-b-2 ${
          isActive 
            ? 'border-primary text-primary font-medium' 
            : 'border-transparent hover:border-gray-300 hover:text-gray-700'
        }`;

      case 'bordered':
        return `${baseClasses} border-b ${
          isActive 
            ? 'border-primary text-primary border-b-2 font-medium' 
            : 'border-transparent hover:text-gray-700'
        }`;

      case 'pills':
        return `${baseClasses} rounded-md ${
          isActive 
            ? 'bg-primary text-white font-medium' 
            : 'hover:bg-gray-100 hover:text-gray-700'
        }`;

      default: // 'default'
        return `${baseClasses} ${
          isActive 
            ? 'text-primary font-medium' 
            : 'text-gray-500 hover:text-gray-700'
        }`;
    }
  };

  // Orientation-specific container classes
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  // Alignment-specific classes (only for horizontal)
  const getAlignmentClasses = () => {
    if (orientation === 'vertical') return '';
    
    switch (alignment) {
      case 'center':
        return 'justify-center';
      case 'end':
        return 'justify-end';
      case 'stretch':
        return 'justify-between';
      default: // 'start'
        return 'justify-start';
    }
  };

  // Ripple effect function
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disableRipple) return;
    
    const button = e.currentTarget;
    
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.querySelector('.ripple');
    
    if (ripple) {
      ripple.remove();
    }
    
    button.appendChild(circle);
  };

  return (
    <div 
      className={`tabs-component ${className}`}
      data-testid={testId}
    >
      {/* Tab list */}
      <div 
        className={`flex ${orientationClasses[orientation]} ${getAlignmentClasses()} mb-4 border-b border-gray-200 ${tabsClassName}`}
        role="tablist"
        aria-orientation={orientation}
        data-testid={`${testId}-tablist`}
      >
        {items.map((item) => {
          const isActive = activeTabId === item.id;
          const isDisabled = item.disabled || false;
          
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              id={`tab-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`relative ${orientation === 'horizontal' ? 'px-4 py-2' : 'px-3 py-2'} flex items-center 
                ${orientation === 'vertical' ? 'justify-start' : 'justify-center'}
                ${getTabVariantClasses(isActive, isDisabled)} 
                overflow-hidden
                ${tabClassName}`}
              onClick={(e) => {
                if (!isDisabled) {
                  createRipple(e);
                  handleTabChange(item.id);
                }
              }}
              disabled={isDisabled}
              data-testid={`${testId}-tab-${item.id}`}
            >
              {item.icon && (
                <span className={`${typeof item.label === 'string' ? 'mr-2' : ''} flex-shrink-0`}>
                  {item.icon}
                </span>
              )}
              
              <span>{item.label}</span>
              
              {item.badge && (
                <span className="ml-2 flex-shrink-0">
                  {item.badge}
                </span>
              )}
              
              {/* This span will receive the ripple element */}
              <span className="ripple-container"></span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div 
        role="tabpanel"
        aria-labelledby={`tab-${activeTabId}`}
        id={`panel-${activeTabId}`}
        className={contentClassName}
        data-testid={`${testId}-content`}
      >
        {activeTabContent}
      </div>

      {/* Ripple styles */}
      <style jsx>{`
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 600ms linear;
          background-color: rgba(255, 255, 255, 0.7);
        }

        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Tabs; 