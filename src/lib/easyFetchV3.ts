type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD'
type Args = {
  route: string,
  method: Methods,
  params?: Record<string, any>,
  body?: any,
  skipJSON?: boolean,
  retryCount?: number,
}

export default function easyFetchV3<T>({
  route,
  method,
  params,
  body,
  skipJSON,
  retryCount = 0
}: Args): Promise<T> {
  if (params) route += `?${new URLSearchParams(params)}`
  return fetch(route, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined, 
    body: body ? JSON.stringify(body) : undefined,
  }).then(res => skipJSON ? res : res.json())
    .catch((err) => {
      console.log('fetch failed, attempt', retryCount)
      if(retryCount < 5) return easyFetchV3({
        route,
        method,
        params,
        body,
        skipJSON,
        retryCount: retryCount + 1
      })
    });
}
