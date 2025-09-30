export type CountdownManager = {
  start: (seconds: number) => Promise<boolean>
  cancel: () => void
  complete: () => void
  reset: () => void
}

export const createCountdownManager = (
  onTick: (remainingSeconds: number) => void,
): CountdownManager => {
  let timer: ReturnType<typeof setInterval> | null = null
  let resolver: ((shouldLaunch: boolean) => void) | null = null
  let remainingSeconds = 0

  const updateCountdown = (value: number) => {
    remainingSeconds = value
    onTick(value)
  }

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const resolve = (value: boolean) => {
    if (!resolver) {
      return
    }

    const resolveFn = resolver
    resolver = null
    resolveFn(value)
  }

  return {
    start: (seconds: number) => {
      clearTimer()
      updateCountdown(Math.max(0, seconds))

      if (remainingSeconds === 0) {
        return Promise.resolve(true)
      }

      return new Promise<boolean>((resolvePromise) => {
        resolver = resolvePromise

        timer = setInterval(() => {
          if (remainingSeconds <= 1) {
            clearTimer()
            updateCountdown(0)
            resolve(true)
            return
          }

          updateCountdown(remainingSeconds - 1)
        }, 1000)
      })
    },
    cancel: () => {
      clearTimer()
      updateCountdown(0)
      resolve(false)
    },
    complete: () => {
      if (remainingSeconds === 0) {
        resolve(true)
        return
      }

      clearTimer()
      updateCountdown(0)
      resolve(true)
    },
    reset: () => {
      clearTimer()
      updateCountdown(0)
      resolver = null
    },
  }
}
