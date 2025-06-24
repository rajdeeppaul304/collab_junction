const Logo = () => {
  return (
    <div className="flex items-center">
      <span className="text-white font-bold text-xl">COLLAB</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-1">
        <path
          d="M16.5 6L12 1.5L7.5 6M12 22.5L7.5 18L12 13.5L16.5 18L12 22.5Z"
          stroke="#FFEB3B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-white font-bold text-xl">JUNCTION</span>
    </div>
  )
}

export default Logo
