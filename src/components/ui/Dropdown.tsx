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
  items: (DropdownItemProps | DropdownDividerProps | DropdownCustomItemProps)[];
  className?: string;
}

export interface DropdownCustomItemProps {
  id?: string;
  type: 'custom';
  content: React.ReactNode;
  className?: string;
}

export type DropdownItemType = DropdownItemProps | DropdownDividerProps | DropdownSectionProps | DropdownCustomItemProps;

// ... rest of the file stays the same 