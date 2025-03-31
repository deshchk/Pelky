import Loader from "@/assets/loader.svg?react"

export default function Loading() {
  return (
    <div className="size-full grid place-items-center">
      <Loader className="text-sky-800 size-12"/>
    </div>
  )
}