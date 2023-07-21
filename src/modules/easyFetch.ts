export default function easyFetch(
  path: string, 
  method: string, 
  body: { [key: string]: any } = {},
): Promise<any> {
  method = method.toUpperCase();

  let result = null;

  if (['GET', 'HEAD', 'DELETE'].includes(method)) {
    // return fetch(path + '?' + new URLSearchParams(body), { method }).then((res: Response) => res.json())
    result = fetch(path + '?' + new URLSearchParams(body), { method }).then((res: Response) => res.json())
  } else if (['POST', 'PUT'].includes(method)){
    // return fetch(path, {
    //   method,
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(body),
    // }).then((res: Response) => res.json())
    result = fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res: Response) => res.json())
  }
  // return Promise.reject({ error: 'Method used is not supported by easyFetch' })
  if (!result) throw new Error(`Fetch method ${method} is not supported`)
  return result;
}
