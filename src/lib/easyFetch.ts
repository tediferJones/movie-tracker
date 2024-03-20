type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD'

export default function easyFetch<T>(
  route: string,
  method: Methods,
  body?: any,
  skipJSON?: boolean,
  retryCount = 0,
): Promise<T> {
  const useUrlParams = ['GET'].includes(method) ;
  const params = useUrlParams ? `?${new URLSearchParams(body)}` : '';
  const finalRoute = route + params;
  return fetch(finalRoute, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body && !useUrlParams ? JSON.stringify(body) : undefined,
  }).then(res => skipJSON ? res : res.json())
    .catch(() => {
      if(retryCount < 5) easyFetch(route, method, body, skipJSON, retryCount + 1)
    });
}

// export default
// function easyFetch_OLD(
//   path: string, 
//   method: string, 
//   body: { [key: string]: any } = {},
// ): Promise<any> {
//   method = method.toUpperCase();
//   let result = null;
// 
//   if (['GET', 'HEAD', 'DELETE'].includes(method)) {
//     result = fetch(path + '?' + new URLSearchParams(body), { method })
//   } else if (['POST', 'PUT'].includes(method)){
//     result = fetch(path, {
//       method,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     })
//   }
// 
//   if (!result) throw new Error(`Fetch method ${method} is not supported`)
//   return result.then((res: Response) => res.json());
// }
