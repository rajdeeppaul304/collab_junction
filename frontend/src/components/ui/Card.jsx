const Card = ({
  children,
  className = "",
  padding = "p-6",
  rounded = "rounded-xl",
  border = false,
}) => {
  return (
    <div
      className={`
        bg-[#2B2B2B]
        ${padding}
        ${rounded}
        ${border
          ? "border-2 border-black shadow-[0_8px_20px_rgba(0,0,0,0.7)] shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
          : ""
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;

