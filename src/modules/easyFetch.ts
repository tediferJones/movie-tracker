export default function easyFetch(
  path: string, 
  method: string, 
  body: { [key: string]: any } = {},
): Promise<any> {
  method = method.toUpperCase();
  let result = null;

  if (['GET', 'HEAD', 'DELETE'].includes(method)) {
    result = fetch(path + '?' + new URLSearchParams(body), { method })
  } else if (['POST', 'PUT'].includes(method)){
    result = fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  if (!result) throw new Error(`Fetch method ${method} is not supported`)
  return result.then((res: Response) => res.json());
}
