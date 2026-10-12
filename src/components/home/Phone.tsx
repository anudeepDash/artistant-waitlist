import React from 'react';
import s from './phone.module.css';

/**
 * A modern phone frame. Children render inside the screen below the status bar.
 * `edge` lets children fill the whole screen with the status bar drawn on top;
 * `bare` drops the status bar too (for real app screenshots that carry their own).
 */
export default function Phone({
  width = 290,
  time = '9:41',
  background,
  bare,
  edge,
  className,
  children,
}: {
  /** Pixels, or any CSS length (e.g. one that fits the phone to its container). */
  width?: number | string;
  time?: string;
  background?: string;
  bare?: boolean;
  edge?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const chrome = (
    <>
      <div className={s.island} />
      <div className={`${s.status} ${edge ? s.statusOver : ''}`}>
        <span>{time}</span>
        <span className={s.statusIcons} aria-hidden="true">
          ●●● <i />
        </span>
      </div>
    </>
  );

  return (
    <div className={`${s.phone} ${className ?? ''}`} style={{ '--w': typeof width === 'number' ? `${width}px` : width } as React.CSSProperties}>
      <div className={s.screen} style={background ? { background } : undefined}>
        {bare ? (
          <div className={s.bare}>{children}</div>
        ) : edge ? (
          <>
            <div className={s.bare}>{children}</div>
            {chrome}
          </>
        ) : (
          <>
            {chrome}
            <div className={s.body}>{children}</div>
          </>
        )}
      </div>
    </div>
  );
}

/** Standard screen padding, for use inside an `edge` phone. */
export function PhoneBody({ children }: { children: React.ReactNode }) {
  return <div className={s.body}>{children}</div>;
}
