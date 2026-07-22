'use client'

import type { Activity, Category, DayPlan } from '@/lib/types'
import { CATEGORIES } from '@/lib/categories'
import { formatRange, hourLabel, toMinutes } from '@/lib/time'

const HOUR_PX = 56
// The visible day runs 7 AM – midnight. Blocks outside the window are clamped
// (the modal and calendar exports keep the true times).
const DAY_START_MIN = 7 * 60
const DAY_END_MIN = 24 * 60
const GRID_HEIGHT = ((DAY_END_MIN - DAY_START_MIN) / 60) * HOUR_PX
const HOUR_COUNT = (DAY_END_MIN - DAY_START_MIN) / 60

interface LaidActivity {
  activity: Activity
  top: number
  height: number
  leftPct: number
  widthPct: number
  spillsPastMidnight: boolean
}

/**
 * Positions activities on the 24h grid. Overlapping activities are split into
 * side-by-side lanes within their overlap cluster.
 */
function layoutDay(activities: Activity[]): LaidActivity[] {
  const events = activities
    .map((a) => ({
      a,
      s: Math.max(toMinutes(a.start), DAY_START_MIN),
      e: Math.min(toMinutes(a.end), DAY_END_MIN),
      spills: toMinutes(a.end) > DAY_END_MIN,
    }))
    .sort((x, y) => x.s - y.s || y.e - x.e)

  const results: LaidActivity[] = []
  let cluster: typeof events = []
  let clusterEnd = -1

  const flushCluster = () => {
    if (cluster.length === 0) return
    const laneEnds: number[] = []
    const lanes = cluster.map((ev) => {
      let lane = laneEnds.findIndex((end) => end <= ev.s)
      if (lane === -1) {
        lane = laneEnds.length
        laneEnds.push(ev.e)
      } else {
        laneEnds[lane] = ev.e
      }
      return lane
    })
    const laneCount = laneEnds.length
    cluster.forEach((ev, i) => {
      results.push({
        activity: ev.a,
        top: ((ev.s - DAY_START_MIN) / 60) * HOUR_PX,
        height: Math.max(((ev.e - ev.s) / 60) * HOUR_PX, 30),
        leftPct: (lanes[i] / laneCount) * 100,
        widthPct: 100 / laneCount,
        spillsPastMidnight: ev.spills,
      })
    })
  }

  for (const ev of events) {
    if (ev.s >= clusterEnd) {
      flushCluster()
      cluster = [ev]
      clusterEnd = ev.e
    } else {
      cluster.push(ev)
      clusterEnd = Math.max(clusterEnd, ev.e)
    }
  }
  flushCluster()
  return results
}

interface DayGridProps {
  day: DayPlan
  onSelect: (activity: Activity) => void
  /** Categories selected in the legend filter; empty = show everything. */
  activeCategories: Category[]
}

export default function DayGrid({ day, onSelect, activeCategories }: DayGridProps) {
  const laid = layoutDay(day.activities)

  return (
    <div className="relative mx-2 sm:mx-4" style={{ height: GRID_HEIGHT }}>
      {/* Hour rules + labels */}
      {Array.from({ length: HOUR_COUNT }, (_, i) => {
        const hour = i + DAY_START_MIN / 60
        return (
        <div
          key={hour}
          className="absolute inset-x-0 border-t border-rule/70"
          style={{ top: i * HOUR_PX }}
        >
          <span className="absolute -top-2 left-0 w-12 pr-2 text-right text-[10px] font-medium uppercase text-ink/40">
            {hourLabel(hour)}
          </span>
          {/* faint half-hour rule */}
          <div
            className="absolute inset-x-14 border-t border-dashed border-rule/40"
            style={{ top: HOUR_PX / 2 }}
          />
        </div>
        )
      })}

      {/* Ledger-style red margin line */}
      <div
        className="absolute bottom-0 top-0 border-l border-spice/40"
        style={{ left: 56, boxShadow: '2px 0 0 -1px rgba(193,68,14,0.25)' }}
        aria-hidden
      />

      {/* Activity blocks */}
      <div className="absolute bottom-0 top-0" style={{ left: 64, right: 4 }}>
        {laid.map(({ activity, top, height, leftPct, widthPct, spillsPastMidnight }) => {
          const cat = CATEGORIES[activity.category]
          const compact = height < 48
          const dimmed =
            activeCategories.length > 0 &&
            !activeCategories.includes(activity.category)
          return (
            <button
              key={activity.id}
              type="button"
              onClick={() => onSelect(activity)}
              className={`absolute flex flex-col items-stretch justify-start overflow-hidden rounded-sm px-2 py-1 text-left shadow-block transition-[transform,opacity,filter] hover:z-10 hover:-translate-y-px hover:scale-[1.01] ${cat.block} ${
                dimmed ? 'opacity-20 saturate-50 hover:opacity-60' : ''
              }`}
              style={{
                top,
                height,
                left: `calc(${leftPct}% + 2px)`,
                width: `calc(${widthPct}% - 4px)`,
                backgroundImage: cat.pattern,
              }}
            >
              <span
                className={`block truncate font-bold uppercase tracking-wide opacity-70 ${
                  compact ? 'text-[8px]' : 'text-[9px]'
                }`}
              >
                {cat.icon} {formatRange(activity.start, activity.end)}
                {spillsPastMidnight && ' ⁺¹'}
              </span>
              <span
                className={`block font-semibold leading-snug ${
                  compact ? 'truncate text-xs' : 'text-sm'
                }`}
              >
                {activity.title}
              </span>
              {!compact && activity.location && (
                <span className="block truncate text-[11px] opacity-70">
                  {activity.location}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
