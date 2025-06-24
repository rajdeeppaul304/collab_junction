import { forwardRef } from "react"

const Input = forwardRef(({ label, name, type = "text", placeholder, error, className = "", ...props }, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium mb-1 text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 bg-gray-800 border border-gray-700 
          rounded-md text-white placeholder-gray-500 
          focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
})

Input.displayName = "Input"

export default Input
