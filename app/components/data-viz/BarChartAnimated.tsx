'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

type BarData = {
  label: string;
  value: number;
  color?: string;
};

type BarChartAnimatedProps = {
  data: BarData[];
  height?: number;
  maxValue?: number;
  showValues?: boolean;
};

export const BarChartAnimated = ({
  data,
  height = 300,
  maxValue,
  showValues = true,
}: BarChartAnimatedProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const max = maxValue ?? Math.max(...data.map((d) => d.value)) * 1.2;
    
    data.forEach((_, index) => {
      const bar = barRefs.current[index];
      const valueText = valueRefs.current[index];
      
      if (bar) {
        gsap.fromTo(
          bar,
          { scaleY: 0 },
          {
            scaleY: data[index].value / max,
            duration: 1.2,
            ease: 'power3.out',
            delay: index * 0.1,
          }
        );
      }
      
      if (valueText && showValues) {
        gsap.fromTo(
          valueText,
          { textContent: 0 },
          {
            textContent: data[index].value,
            duration: 1.5,
            ease: 'power3.out',
            delay: index * 0.1 + 0.3,
            snap: { textContent: 1 },
            modifiers: {
              textContent: (value: string) => Math.round(parseFloat(value)).toString(),
            },
          }
        );
      }
    });
  }, [data, maxValue, showValues]);

  const max = maxValue ?? Math.max(...data.map((d) => d.value)) * 1.2;

  return (
    <div ref={chartRef} className="w-full" style={{ height }}>
      <div className="flex items-end justify-around h-full gap-2 sm:gap-4">
        {data.map((item, index) => {
          const barHeight = `${(item.value / max) * 100}%`;
          const color = item.color ?? '#06b6d4';
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 min-w-[60px]">
              <div className="relative w-full flex items-end justify-center" style={{ height: height - 40 }}>
                <div
                  ref={(el) => { barRefs.current[index] = el; }}
                  className="w-full max-w-[60px] rounded-t-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{
                    height: barHeight,
                    background: `linear-gradient(to top, ${color}, ${color}88)`,
                    boxShadow: `0 0 20px ${color}44`,
                  }}
                />
                {showValues && (
                  <span
                    ref={(el) => { valueRefs.current[index] = el; }}
                    className="absolute -top-6 text-xs font-bold font-mono"
                    style={{ color: 'var(--foreground)' }}
                  >
                    0
                  </span>
                )}
              </div>
              <p className="mt-2 text-[10px] sm:text-xs text-center font-medium truncate w-full" style={{ color: 'var(--foreground-muted)' }}>
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
