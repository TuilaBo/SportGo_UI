import React from 'react';

export default function GoogleMapEmbed({ address, height = 320 }) {
  if (!address) return null;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&hl=vi&z=16&output=embed`;
  return (
    <div className="rounded-xl overflow-hidden border">
      <iframe
        title="map"
        src={src}
        width="100%"
        height={height}
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}



