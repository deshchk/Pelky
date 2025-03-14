import TrackerItem from "@/components/tracker/TrackerItem"

function TrackerList({items, data}) {

  return (
    <ul className="grid grid-cols-1 gap-4 empty:hidden">
      {items.map(item => (
        <TrackerItem key={item.id} item={item} data={data}>{item.title}</TrackerItem>
      ))}
    </ul>
  )
}

export default TrackerList