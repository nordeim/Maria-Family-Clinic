import { useCallback } from "react"

export type HapticType = 
  | "light" 
  | "medium" 
  | "heavy" 
  | "selection" 
  | "impact-light" 
  | "impact-medium" 
  | "impact-heavy" 
  | "notification-success" 
  | "notification-warning" 
  | "notification-error"

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: HapticType = "light") => {
    // Check if navigator.vibrate is supported
    if ('vibrate' in navigator) {
      let pattern: number | number[]

      switch (type) {
        case "light":
          pattern = 10
          break
        case "medium":
          pattern = 30
          break
        case "heavy":
          pattern = 50
          break
        case "selection":
          pattern = 1
          break
        case "impact-light":
          pattern = 10
          break
        case "impact-medium":
          pattern = 30
          break
        case "impact-heavy":
          pattern = 50
          break
        case "notification-success":
          pattern = [10, 50, 10]
          break
        case "notification-warning":
          pattern = [10, 100, 10, 100, 10]
          break
        case "notification-error":
          pattern = [100, 50, 100]
          break
        default:
          pattern = 10
      }

      navigator.vibrate(pattern)
    }

    // iOS Safari - can also use vibrations on supported devices
    // Note: iOS vibration API is limited and mainly works with gamepad haptic
    // This is a placeholder for future iOS haptic implementations
  }, [])

  const triggerSuccess = useCallback(() => triggerHaptic("notification-success"), [triggerHaptic])
  const triggerWarning = useCallback(() => triggerHaptic("notification-warning"), [triggerHaptic])
  const triggerError = useCallback(() => triggerHaptic("notification-error"), [triggerHaptic])
  const triggerSelection = useCallback(() => triggerHaptic("selection"), [triggerHaptic])

  return {
    triggerHaptic,
    triggerSuccess,
    triggerWarning,
    triggerError,
    triggerSelection,
  }
}

export default useHapticFeedback