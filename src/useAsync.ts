import React from 'react'

/**
 * State of the `useAsync` hook (Managed by the AsyncReducer).
 */
export interface State<T> {
  status: 'idle' | 'pending' | 'rejected' | 'resolved'
  data: null | T
  error: null | Error
}

/**
 * Action passed to the AsyncReducer.`
 */
export type Action<T> = Partial<State<T>>

export type AsyncReducer<T> = (
  prevState: State<T>,
  action: Action<T>,
) => State<T>

/**
 * Prevents updating state on an unmounted component.
 */
function useSafeDispatch<T>(
  dispatch: React.Dispatch<React.ReducerAction<AsyncReducer<T>>>,
) {
  const mounted = React.useRef(false)

  React.useLayoutEffect(() => {
    mounted.current = true

    return () => {
      mounted.current = false
    }
  }, [])

  return React.useCallback(
    (action: Action<T>) => {
      if (mounted.current) dispatch(action)
    },
    [dispatch],
  )
}

/**
 * Async hook derived from Kent C Dodd's react-performance workshop:
 * https://github.com/kentcdodds/react-performance/blob/94c95c009d41c4d29258dfc5cd9c9dd4e03a063d/src/utils.js#L22
 *
 * @example
 * const { data, error, status, run } = useAsync<Post>()
 *
 * React.useEffect(() => {
 *   run(async () => {
 *     const response = await fetch(
 *       `https://jsonplaceholder.typicode.com/posts/${props.postId}`
 *     )
 *
 *     const data = await response.json() as Post
 *
 *     if (!response.ok) {
 *       throw new Error(`Failed to fetch post: #${props.postId}.`)
 *     }
 *
 *     return data
 *   })
 * }, [props.postId, run])
 *
 * return status === 'idle' || status === 'pending'
 *   ? <div>loading</div>
 *   : status === 'rejected'
 *   ? <div>Failed to fetch post: ${postId}</div>
 *   : (
 *     <>
 *       <h1>data.title</h1>
 *       <p>data.body</p>
 *     </>
 *   )
 */
export function useAsync<T>(initialState: Action<T> = {}) {
  const initialStateRef = React.useRef<State<T>>({
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  })

  const [{ status, data, error }, setState] = React.useReducer<AsyncReducer<T>>(
    (prevState, action) => ({ ...prevState, ...action }),
    initialStateRef.current,
  )

  const safeSetState = useSafeDispatch<T>(setState)

  const run = React.useCallback(
    async (promise: Promise<T> | (() => Promise<T>)) => {
      try {
        safeSetState({ status: 'pending' })

        // eslint-disable-next-line no-shadow
        const data: T = await (typeof promise === 'function'
          ? promise()
          : promise)

        safeSetState({
          status: 'resolved',
          data,
        })

        return data
      } catch (error) {
        // eslint-disable-line no-shadow
        if (error instanceof Error) {
          safeSetState({
            status: 'rejected',
            error,
          })

          return error
        }

        const defaultError = new Error(
          'Failed to perform asynchronous operation.',
        )

        safeSetState({
          status: 'rejected',
          error: defaultError,
        })

        return defaultError
      }
    },
    [safeSetState],
  )

  const setData = React.useCallback(
    // eslint-disable-next-line no-shadow
    (data: T) => safeSetState({ data }),
    [safeSetState],
  )

  const setError = React.useCallback(
    // eslint-disable-next-line no-shadow
    (error: Error) => safeSetState({ error }),
    [safeSetState],
  )

  const reset = React.useCallback(() => safeSetState(initialStateRef.current), [
    safeSetState,
  ])

  return {
    // Using the same names that react-query uses for convenience
    isIdle: status === 'idle',
    isLoading: status === 'pending',
    isError: status === 'rejected',
    isSuccess: status === 'resolved',

    setData,
    setError,
    error,
    status,
    data,
    run,
    reset,
  }
}

export default useAsync
