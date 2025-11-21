import type { UserProfile } from '../types'

const DEFAULT_USER: UserProfile = {
  name: 'Current User',
  email: '',
  role: '',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  currency: 'USD'
}

/**
 * Get the current user profile from localStorage
 */
export function getUserProfile(): UserProfile {
  try {
    const savedProfile = localStorage.getItem('taskflow-user-profile')
    if (savedProfile) {
      return JSON.parse(savedProfile)
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
  return DEFAULT_USER
}

/**
 * Get the current user's name
 */
export function getCurrentUserName(): string {
  const profile = getUserProfile()
  return profile.name || 'Current User'
}

/**
 * Get the current user's ID (using email as unique identifier)
 */
export function getCurrentUserId(): string {
  const profile = getUserProfile()
  return profile.email || 'current-user'
}
