import { TimeSpan } from '~/@/time/time-span'

export type LatencyStatus =
  | { t: 'excellent' }
  | { t: 'good' }
  | { t: 'acceptable' }
  | { t: 'tolerable' }
  | { t: 'poor' }

const fromTimeSpan = (latency: TimeSpan): LatencyStatus => {
  if (TimeSpan.lte(latency, TimeSpan.milliseconds(100))) {
    return { t: 'excellent' }
  }

  if (TimeSpan.lte(latency, TimeSpan.milliseconds(300))) {
    return { t: 'good' }
  }

  if (TimeSpan.lte(latency, TimeSpan.milliseconds(600))) {
    return { t: 'acceptable' }
  }

  if (TimeSpan.lte(latency, TimeSpan.milliseconds(1000))) {
    return { t: 'tolerable' }
  }

  return { t: 'poor' }
}

export const LatencyStatus = {
  fromTimeSpan,
}
