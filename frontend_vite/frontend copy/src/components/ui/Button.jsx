"use client"

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) => {
  const baseClasses = "rounded-md font-medium transition-colors"

  const variantClasses = {
    primary: "bg-yellow-400 text-black hover:bg-yellow-500",
    secondary: "bg-gray-800 text-white hover:bg-gray-700",
    outline: "bg-transparent border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black",
    ghost: "bg-transparent text-white hover:bg-gray-800",
  }

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  }

  const widthClass = fullWidth ? "w-full" : ""
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${widthClass} 
        ${disabledClass}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export default Button
