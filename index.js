import React from 'react'

function useAsync(fn, immediate = true) {
  const [pending, setPending] = React.useState(false)
  const [value, setValue] = React.useState(null)
  const [error, setError] = React.useState(null)

  const execute = useCallback(() => {
    setPending(true)
    setValue(null)
    setError(null)
    return fn()
      .then(response => setValue(response))
      .catch(error => setError(error))
      .finally(() => setPending(false))
  }, [fn])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, pending, value, error }
}

export default useAsync
