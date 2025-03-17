function DaySelector ({selectedDays, setSelectedDays}) {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

  function onChange(e) {
    setSelectedDays(prev => (
      prev.includes(Number(e.target.dataset.dayNum)) ?
        prev.toSpliced(prev.indexOf(Number(e.target.dataset.dayNum)), 1) :
        prev.concat([Number(e.target.dataset.dayNum)])
    ))
  }

  function onWeekendClick() {
    setSelectedDays(prev => prev.length < 5 || prev.length === 7 ? [0,1,2,3,4] : [5,6])
  }

  function onAllClick() {
    setSelectedDays(prev => prev.length < 7 ? [0,1,2,3,4,5,6] : [])
  }

  return (
    <div className="flex flex-col gap-5 overflow-hidden">
      <div className="flex self-end text-xs font-medium gap-3 mb-1">
        <button className="px-4 py-1 bg-slate-700 rounded" onClick={onWeekendClick}>
          {selectedDays.length < 5 || selectedDays.length === 7 ? 'Working days' : 'Weekend only'}
        </button>

        <button className="px-4 py-1 bg-slate-700 rounded" onClick={onAllClick}>
          {selectedDays.length < 7 ? 'Check all' : 'Uncheck all'}
        </button>
      </div>

      <div className="flex flex-wrap rounded overflow-hidden gap-3 touch-manipulation">
        {[...days.slice(-2), ...days.slice(0, -2)].map((day, i) => (
            <label key={day} htmlFor={`day-${i}`} className={`
            flex-1 ${i === 0 || i === 1 ? 'basis-[calc(50%_-_6px)]' : 'basis-[20%-6px]'}
            text-center bg-slate-700 px-1 py-2.5 font-medium
            has-checked:bg-yellow-500 has-checked:text-black rounded
          `.trim()}>
            {day}
            <input type="checkbox" id={`day-${i}`} className="sr-only" onChange={onChange}
              data-day-num={days.indexOf(day)} checked={selectedDays.includes(days.indexOf(day))}/>
          </label>
        ))}
      </div>
    </div>
  )
}

export default DaySelector