function DaysSelector ({selectedDays, setSelectedDays}) {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

  function onChange(e) {
    setSelectedDays(prev => (
      prev.includes(Number(e.target.dataset.dayNum)) ?
        prev.toSpliced(prev.indexOf(Number(e.target.dataset.dayNum)), 1) :
        prev.concat([Number(e.target.dataset.dayNum)])
    ))
  }

  function onAllClick() {
    setSelectedDays(prev => prev.length < 7 ? [0,1,2,3,4,5,6] : [])
  }

  return (
    <>
      <button className="text-xs font-medium self-end px-4 py-1 bg-slate-700 rounded" onClick={onAllClick}>
        {selectedDays.length < 7 ? 'Check all' : 'Uncheck all'}
      </button>

      <div className="flex flex-wrap rounded overflow-hidden gap-1 touch-manipulation">
        {[...days.slice(-2), ...days.slice(0, -2)].map((day, i) => (
          <label key={day} htmlFor={`day-${i}`} className={`
            flex-1 ${i === 0 || i === 1 ? 'basis-[calc(50%_-_2px)]' : 'basis-[20%-2px]'}
            text-center bg-slate-700 px-1 py-2.5 font-medium
            has-checked:bg-yellow-500 has-checked:text-black
          `.trim()}>
            {day}
            <input type="checkbox" id={`day-${i}`} className="sr-only" onChange={onChange}
              data-day-num={days.indexOf(day)} checked={selectedDays.includes(days.indexOf(day))}/>
          </label>
        ))}
      </div>

    </>
  )
}

export default DaysSelector