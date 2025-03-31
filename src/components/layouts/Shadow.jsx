function Shadow({onClick}) {
  return (
    <div onClick={onClick} className="fixed inset-0 bg-black/40 backdrop-blur z-20">
    </div>
  )
}

export default Shadow