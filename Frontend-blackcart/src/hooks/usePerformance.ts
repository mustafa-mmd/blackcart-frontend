import { useEffect, useCallback } from 'react'

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

interface NavigationTiming {
  startTime: number
  duration: number
  domainLookupStart: number
  domainLookupEnd: number
  connectStart: number
  connectEnd: number
  requestStart: number
  responseStart: number
  responseEnd: number
  domInteractive: number
  domContentLoadedEventStart: number
  domContentLoadedEventEnd: number
  loadEventStart: number
  loadEventEnd: number
}

const usePerformance = (onReport?: (metrics: PerformanceMetrics) => void) => {
  const getNavigationTiming = useCallback((): NavigationTiming | null => {
    if (!performance || !performance.getEntriesByType) return null
    
    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (!navigation) return null

    return {
      startTime: navigation.startTime,
      duration: navigation.duration,
      domainLookupStart: navigation.domainLookupStart,
      domainLookupEnd: navigation.domainLookupEnd,
      connectStart: navigation.connectStart,
      connectEnd: navigation.connectEnd,
      requestStart: navigation.requestStart,
      responseStart: navigation.responseStart,
      responseEnd: navigation.responseEnd,
      domInteractive: navigation.domInteractive,
      domContentLoadedEventStart: navigation.domContentLoadedEventEnd,
      domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
      loadEventStart: navigation.loadEventStart,
      loadEventEnd: navigation.loadEventEnd
    }
  }, [])

  const getWebVitals = useCallback(async (): Promise<PerformanceMetrics> => {
    const metrics: PerformanceMetrics = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null
    }

    try {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry
      if (fcpEntry) {
        metrics.fcp = Math.round(fcpEntry.startTime)
      }

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        metrics.lcp = Math.round(lastEntry.startTime)
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries() as PerformanceEventTiming[]
        const firstEntry = entries[0]
        metrics.fid = Math.round(firstEntry.processingStart - firstEntry.startTime)
      })
      fidObserver.observe({ type: 'first-input', buffered: true })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            metrics.cls = (metrics.cls || 0) + (entry as any).value
          }
        })
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })

      // Time to First Byte
      const navigationTiming = getNavigationTiming()
      if (navigationTiming) {
        metrics.ttfb = Math.round(navigationTiming.responseStart - navigationTiming.startTime)
      }

      // Wait a bit for metrics to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Disconnect observers
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()

    } catch (error) {
      console.error('Error getting web vitals:', error)
    }

    return metrics
  }, [getNavigationTiming])

  const logPerformance = useCallback(async () => {
    const metrics = await getWebVitals()
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('📊 Performance Metrics:', {
        'First Contentful Paint': metrics.fcp ? `${metrics.fcp}ms` : 'N/A',
        'Largest Contentful Paint': metrics.lcp ? `${metrics.lcp}ms` : 'N/A',
        'First Input Delay': metrics.fid ? `${metrics.fid}ms` : 'N/A',
        'Cumulative Layout Shift': metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
        'Time to First Byte': metrics.ttfb ? `${metrics.ttfb}ms` : 'N/A'
      })
    }

    // Send to analytics/backend in production
    if (process.env.NODE_ENV === 'production' && onReport) {
      onReport(metrics)
      
      // Example: Send to analytics endpoint
      // fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metrics)
      // })
    }

    return metrics
  }, [getWebVitals, onReport])

  useEffect(() => {
    // Log performance on page load
    if (document.readyState === 'complete') {
      logPerformance()
    } else {
      window.addEventListener('load', logPerformance)
      return () => window.removeEventListener('load', logPerformance)
    }
  }, [logPerformance])

  return {
    logPerformance,
    getNavigationTiming,
    getWebVitals
  }
}

export default usePerformance