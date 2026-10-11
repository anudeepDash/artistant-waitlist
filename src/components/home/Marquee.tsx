import React from 'react';
import s from './home.module.css';

const ROW_A = ['Acoustic acts', 'Live bands', 'Club DJs', 'College headliners', 'Wedding sangeets', 'Corporate nights', 'Stand-up comics'];
const ROW_B = ['Jazz brunches', 'Session musicians', 'Sound engineers', 'Weekend DJ sets', 'Campus fests', 'Rooftop gigs', 'Sufi nights'];

function Row({ items, reverse }: { items: string[]; reverse?: boolean }) {
  // Two copies back-to-back so the -50% translate loops seamlessly.
  const doubled = [...items, ...items];
  return (
    <div className={reverse ? s.marqueeRowReverse : s.marqueeRow}>
      {doubled.map((item, i) => (
        <span key={i} className={s.marqueeItem} aria-hidden={i >= items.length}>
          {item}
          <span className={s.marqueeStar}>✦</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className={s.marquee} aria-label="Who books and plays on Artistant">
      <Row items={ROW_A} />
      <Row items={ROW_B} reverse />
    </div>
  );
}
