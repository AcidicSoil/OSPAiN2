"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
// ... keep other parts of the file
const Button = ({ children, variant = 'primary', size = 'md', isLoading = false, startIcon, endIcon, fullWidth = false, disabled = false, className = '', ...props }) => {
    // Base classes
    const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    // Variant classes
    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
        secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary',
        tertiary: 'bg-tertiary text-white hover:bg-tertiary-hover focus:ring-tertiary',
        outline: 'bg-transparent border border-carbon-300 text-text-primary hover:bg-carbon-50 focus:ring-primary',
        ghost: 'bg-transparent text-text-primary hover:bg-carbon-50 focus:ring-primary',
        danger: 'bg-error text-white hover:bg-red-700 focus:ring-error',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
        info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400'
    };
    // ... keep the rest of the file the same
};
exports.Button = Button;
//# sourceMappingURL=Button.js.map