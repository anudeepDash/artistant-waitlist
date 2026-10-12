import React from 'react';
import s from './phone.module.css';

/**
 * A modern phone frame. Children render inside the screen below the status bar,
 * or edge to edge with `bare` (for real app screenshots that carry their own).
 */
export default function Phone({
  width = 290,
  time = '9:41',
  background,
  bare,
  className,
  children,
}: {
  width?: number;
  time?: string;
  background?: string;
  bare?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${s.phone} ${className ?? ''}`} style={{ '--w': `${width}px` } as React.CSSProperties}>
      <div className={s.screen} style={background ? { background } : undefined}>
        {bare ? (
          <div className={s.bare}>{children}</div>
        ) : (
          <>
            <div className={s.island} />
            <div className={s.status}>
              <span>{time}</span>
              <span className={s.statusIcons} aria-hidden="true">
                ●●● <i />
              </span>
            </div>
            <div className={s.body}>{children}</div>
          </>
        )}
      </div>
    </div>
  );
}
