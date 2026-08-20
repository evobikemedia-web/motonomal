import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
  className?: string;
}

const toISO = (d: Date) => d.toISOString().split('T')[0];
const parseISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const isBetween = (day: Date, start: Date, end: Date) => day > start && day < end;
const monthsOverlap = (viewLeft: Date, viewRight: Date, target: Date) => {
  const targetYM = target.getFullYear() * 12 + target.getMonth();
  const leftYM = viewLeft.getFullYear() * 12 + viewLeft.getMonth();
  const rightYM = viewRight.getFullYear() * 12 + viewRight.getMonth();
  return targetYM >= leftYM && targetYM <= rightYM;
};

const getMonthAnchorFromDate = (dateValue: string) => {
  const base = dateValue ? parseISO(dateValue) : new Date();
  return new Date(base.getFullYear(), base.getMonth(), 1);
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  className = '',
}) => {
  const { language } = useLanguage();

  const weekdaysShort = useMemo(
    () =>
      language === 'fr'
        ? ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI']
        : ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'],
    [language]
  );

  const monthNames = useMemo(
    () =>
      language === 'fr'
        ? [
            'JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
            'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE',
          ]
        : [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
          ],
    [language]
  );

  const [leftAnchor, setLeftAnchor] = useState<Date>(() => getMonthAnchorFromDate(startDate));

  useEffect(() => {
    const nextAnchor = getMonthAnchorFromDate(startDate);
    setLeftAnchor((prev) => {
      const prevKey = prev.getFullYear() * 12 + prev.getMonth();
      const nextKey = nextAnchor.getFullYear() * 12 + nextAnchor.getMonth();
      return prevKey === nextKey ? prev : nextAnchor;
    });
  }, [startDate]);

  const [selectionPhase, setSelectionPhase] = useState<'start' | 'end'>('start');

  const rightAnchor = useMemo(
    () => new Date(leftAnchor.getFullYear(), leftAnchor.getMonth() + 1, 1),
    [leftAnchor]
  );

  const shiftMonths = (delta: number) => {
    setLeftAnchor(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  const startD = startDate ? parseISO(startDate) : null;
  const endD = endDate ? parseISO(endDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDayClick = (day: Date) => {
    if (selectionPhase === 'start' || !startD) {
      const iso = toISO(day);
      onChange({ startDate: iso, endDate: iso });
      setSelectionPhase('end');
    } else {
      const startISO = toISO(startD);
      const clickedISO = toISO(day);
      if (day < startD) {
        onChange({ startDate: clickedISO, endDate: startISO });
      } else {
        onChange({ startDate: startISO, endDate: clickedISO });
      }
      setSelectionPhase('start');
    }
  };

  const generateMonthCells = (anchor: Date): Date[] => {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = (firstDay.getDay() + 6) % 7;

    const cells: Date[] = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push(new Date(year, month, 1 - (startWeekday - i)));
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push(new Date(year, month, d));
    }
    while (cells.length < 42) {
      const last = cells[cells.length - 1];
      cells.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
    }
    return cells;
  };

  const renderMonth = (anchor: Date) => {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const cells = generateMonthCells(anchor);

    return (
      <div
        style={{ width: 232 }}
        className="shrink-0 flex flex-col"
      >
        <div className="flex items-center justify-center mb-3" style={{ height: 20 }}>
          <h3 className="text-gray-100 font-semibold text-xs tracking-wide">
            {monthNames[month]} {year}
          </h3>
        </div>

        <div
          className="grid mb-1"
          style={{ gridTemplateColumns: 'repeat(7, 32px)', gridAutoRows: 32, columnGap: 4, rowGap: 4 }}
        >
          {weekdaysShort.map((w) => (
            <div
              key={w}
              style={{ width: 32, height: 32 }}
              className="text-gray-500 uppercase font-medium flex items-center justify-center"
            >
              <span style={{ fontSize: 10 }}>{w}</span>
            </div>
          ))}
        </div>

        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(7, 32px)', gridAutoRows: 32, columnGap: 4, rowGap: 4 }}
        >
          {cells.map((day, idx) => {
            const inMonth = day.getMonth() === month;
            const isStart = startD && sameDay(day, startD);
            const isEnd = endD && sameDay(day, endD);
            const isRange = startD && endD && isBetween(day, startD, endD);
            const isToday = sameDay(day, today);

            const baseStyle: React.CSSProperties = {
              width: 32,
              height: 32,
              fontSize: 12,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              userSelect: 'none',
              padding: 0,
            };

            if (isStart || isEnd) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  style={{
                    ...baseStyle,
                    backgroundColor: '#D4A017',
                    color: '#000',
                    fontWeight: 600,
                    opacity: !inMonth ? 0.8 : 1,
                  }}
                  className="transition-all hover:brightness-110"
                >
                  {day.getDate()}
                </button>
              );
            }

            if (isRange) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  style={{
                    ...baseStyle,
                    backgroundColor: 'rgba(212,160,23,0.15)',
                    color: '#D4A017',
                    opacity: !inMonth ? 0.6 : 1,
                  }}
                  className="transition-colors hover:bg-[#D4A017]/25"
                >
                  {day.getDate()}
                </button>
              );
            }

            if (!inMonth) {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  style={{
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    color: '#52525b',
                  }}
                  className="transition-colors hover:text-gray-400 hover:bg-white/5"
                >
                  {day.getDate()}
                </button>
              );
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleDayClick(day)}
                style={{
                  ...baseStyle,
                  backgroundColor: 'transparent',
                  color: '#d1d5db',
                  boxShadow: isToday ? 'inset 0 0 0 1px rgba(255,255,255,0.2)' : undefined,
                }}
                className="transition-colors hover:bg-white/10"
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#1A1A1A',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        padding: 16,
        minWidth: 580,
        width: 'max-content',
      }}
      className={className}
    >
      <div className="flex items-start justify-between w-full">
        <button
          type="button"
          onClick={() => shiftMonths(-1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            background: 'transparent',
            color: '#a1a1aa',
            marginTop: 18,
          }}
          className="transition-colors hover:text-[#D4A017] hover:bg-white/5"
          aria-label="Previous months"
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
        </button>

        <div className="flex items-start shrink-0" style={{ gap: 20 }}>
          {renderMonth(leftAnchor)}
          <div
            style={{
              width: 1,
              alignSelf: 'stretch',
              backgroundColor: 'rgba(255,255,255,0.1)',
              marginTop: 4,
              marginBottom: 4,
              flexShrink: 0,
            }}
          />
          {renderMonth(rightAnchor)}
        </div>

        <button
          type="button"
          onClick={() => shiftMonths(1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            background: 'transparent',
            color: '#a1a1aa',
            marginTop: 18,
          }}
          className="transition-colors hover:text-[#D4A017] hover:bg-white/5"
          aria-label="Next months"
        >
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};
