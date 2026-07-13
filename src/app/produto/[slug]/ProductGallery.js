'use client'

import { useState } from 'react'

export default function ProductGallery({ images, name }) {
  const gallery = images?.length ? images : []
  const [active, setActive] = useState(0)

  if (gallery.length === 0) {
    return (
      <div className="aspect-square bg-paperDim flex items-center justify-center rounded-sm overflow-hidden">
        <span className="font-display text-5xl text-ink/10">DOS STATES</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square bg-paperDim flex items-center justify-center rounded-sm overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={gallery[active]} alt={name} className="w-full h-full object-cover" />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2">
          {gallery.map((url, i) => (
            <button
              key={url + i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-sm overflow-hidden border shrink-0 ${i === active ? 'border-ink' : 'border-line opacity-70 hover:opacity-100'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${name} - foto ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
