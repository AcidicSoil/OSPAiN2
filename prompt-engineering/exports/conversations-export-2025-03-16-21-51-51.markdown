# Exported Conversations

## Conversation 1: sample-conversation

Timestamp: 2025-03-16T21:51:50.963Z

### User

Can you help me implement a new React component?

### Assistant

I'll help you create a React component. What functionality do you need?

### User

I need a button component with different variants and sizes.

### Assistant

Here's a basic implementation:

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onClick
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

---

