import { useEffect, useState } from 'react'
import type { BehaviorSubject } from 'rxjs'

export function useBehaviorSubjectValue<T>(subject: BehaviorSubject<T>): T {
  const [value, setValue] = useState<T>(() => subject.getValue())

  useEffect(() => {
    const sub = subject.subscribe((v) => setValue(v))
    return () => sub.unsubscribe()
  }, [subject])

  return value
}

