const toKm = (distance) => {
  if (!distance) return 0
  return distance > 1000 ? distance / 1000 : distance
}

const parseStartTime = (startTime) => {
  if (!startTime) return 0
  const parts = startTime.split(':').map(Number)
  if (parts.length < 2) return 0
  const hours = parts[0] || 0
  const minutes = parts[1] || 0
  const seconds = parts[2] || 0
  return hours * 60 + minutes + seconds / 60
}

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.round((minutes % 1) * 60)
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatTimeNoSeconds = (minutes) => {
  const roundedMinutes = Math.round(minutes)
  const hours = Math.floor(roundedMinutes / 60)
  const mins = roundedMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

const formatClockDisplay = (minutes) => {
  const roundedSeconds = Math.round((Number(minutes) || 0) * 60)
  const totalSecondsInDay = 24 * 60 * 60
  const normalizedSeconds = ((roundedSeconds % totalSecondsInDay) + totalSecondsInDay) % totalSecondsInDay
  const hours = Math.floor(normalizedSeconds / 3600)
  const mins = Math.floor((normalizedSeconds % 3600) / 60)
  const hourString = hours < 10 ? String(hours) : hours.toString().padStart(2, '0')
  return `${hourString}:${mins.toString().padStart(2, '0')}`
}

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.round((minutes % 1) * 60)
  const hStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''
  return `${hStr}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDurationNoSeconds = (minutes) => {
  const roundedMinutes = Math.round(minutes)
  const hours = Math.floor(roundedMinutes / 60)
  const mins = roundedMinutes % 60
  const hStr = hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''
  return `${hStr}${mins.toString().padStart(2, '0')}`
}

const formatDurationMinutesSeconds = (minutes) => {
  const roundedSeconds = Math.round((Number(minutes) || 0) * 60)
  const absSeconds = Math.abs(roundedSeconds)
  const hours = Math.floor(absSeconds / 3600)
  const mins = Math.floor((absSeconds % 3600) / 60)
  const secs = absSeconds % 60

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatPaceDisplay = (pace) => {
  const roundedSeconds = Math.round((Number(pace) || 0) * 60)
  const mins = Math.floor(roundedSeconds / 60)
  const secs = Math.abs(roundedSeconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatClockTime = (minutes) => {
  const total = minutes % (24 * 60)
  const hours = Math.floor(total / 60)
  const mins = Math.floor(total % 60)
  const secs = Math.round((total % 1) * 60)
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function useTimeCalculator() {
  const calculateTimes = (race, segmentConfigs = {}, startDelay = 0, startTime = '00:00') => {
    const times = []
    const segments = Array.isArray(race?.segments) ? race.segments : []
    const startBase = parseStartTime(startTime) + (Number(startDelay) || 0)
    let currentTime = startBase

    segments.forEach((segment, index) => {
      const config = segmentConfigs[segment.id] || {}
      const pace = Number(config.pace) || 0
      const distance = toKm(segment.distance || 0)
      const duration = distance * pace
      const startSegmentTime = currentTime
      const arrivalTime = currentTime + duration

      times.push({
        segmentId: segment.id,
        segmentName: segment.name,
        segmentType: segment.type === 'group' ? 'group' : 'solo',
        order: index + 1,
        runner: config.name || '',
        pace,
        distance,
        startTime: startSegmentTime,
        arrivalTime,
        duration
      })

      currentTime = arrivalTime
    })

    return times
  }

  return {
    calculateTimes,
    formatTime,
    formatTimeNoSeconds,
    formatClockDisplay,
    formatDuration,
    formatDurationNoSeconds,
    formatDurationMinutesSeconds,
    formatPaceDisplay,
    formatClockTime
  }
}
