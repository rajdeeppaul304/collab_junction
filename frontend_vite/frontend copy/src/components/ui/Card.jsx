const Card = ({ children, className = "", padding = "p-4", rounded = "rounded-lg", border = false }) => {
  return (
    <div
      className={`
        bg-gray-900 
        ${padding} 
        ${rounded} 
        ${border ? "border border-gray-800" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card
