function SimpleButton({children, className, disabled, onClick}) {
  return (
    <button
      onClick={onClick}
      className={className ?? "py-3 px-6 rounded bg-gray-700 hover:bg-gray-800 focus:bg-gray-800 disabled:text-gray-400"}
      disabled={disabled ?? false}
    >
      {children}
    </button>
  )
}

export default SimpleButton