export default function easyFetch(path: string, method: string, body: object): Promise<any> {
  method = method.toUpperCase();
  console.log(body)

  // All methods have been verified
  if (['GET', 'HEAD', 'DELETE'].includes(method)) {
    // The use of body here seems very strange, why cant we just new URLSearchParams(body), body is already an obj so whats the difference?
    return fetch(path + '?' + new URLSearchParams({ ...body }), { method })
  } else if (['POST', 'PUT'].includes(method)){
    return fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }
  return Promise.reject({ error: 'Method used is not supported by easyFetch' })
}
