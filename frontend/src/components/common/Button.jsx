function Button({ variant = 'primary', children, disabled, onClick, type = 'button' }) {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger: 'border border-red-500 text-red-500 hover:bg-red-50',
  };

  const disabledClasses = 'bg-gray-300 text-gray-500 cursor-not-allowed';

  const className = `${baseClasses} ${disabled ? disabledClasses : variantClasses[variant]}`;

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;