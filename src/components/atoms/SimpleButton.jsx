function SimpleButton({children, className, blue, disabled, onClick}) {
  return (
    <button
      onClick={onClick}
      className={className ?? `py-3 px-6 rounded disabled:text-gray-400 ${blue ? 'bg-sky-800 hover:bg-sky-900 focus:bg-sky-900' : 'bg-gray-700 hover:bg-gray-800 focus:bg-gray-800'}`.trim()}
      disabled={disabled ?? false}
    >
      {children}
    </button>
  )
}

export default SimpleButton