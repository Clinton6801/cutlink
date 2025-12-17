'use client'

import { useState } from 'react'

interface WorkingHours {
  [key: string]: {
    enabled: boolean
    start: string
    end: string
  }
}

interface WorkingHoursSettingsProps {
  initialHours: WorkingHours
  onChange: (hours: WorkingHours) => void
}

export default function WorkingHoursSettings({
  initialHours,
  onChange
}: WorkingHoursSettingsProps) {
  const [hours, setHours] = useState<WorkingHours>(initialHours)

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ]

  const toggleDay = (day: string) => {
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        enabled: !hours[day].enabled
      }
    }
    setHours(newHours)
    onChange(newHours)
  }

  const updateTime = (day: string, field: 'start' | 'end', value: string) => {
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    }
    setHours(newHours)
    onChange(newHours)
  }

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <div
          key={day}
          className={`p-4 rounded-lg border transition ${
            hours[day].enabled
              ? 'bg-black border-gray-700'
              : 'bg-gray-800/50 border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hours[day].enabled}
                onChange={() => toggleDay(day)}
                className="w-5 h-5 cursor-pointer"
              />
              <span className={`font-bold capitalize ${
                hours[day].enabled ? 'text-white' : 'text-gray-500'
              }`}>
                {day}
              </span>
            </label>
          </div>

          {hours[day].enabled && (
            <div className="grid grid-cols-2 gap-4 ml-8">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                <input
                  type="time"
                  value={hours[day].start}
                  onChange={(e) => updateTime(day, 'start', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Time</label>
                <input
                  type="time"
                  value={hours[day].end}
                  onChange={(e) => updateTime(day, 'end', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}