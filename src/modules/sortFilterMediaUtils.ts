import { media } from "@prisma/client";

interface test {
  [key: string]: any
}
export function getMinValue(key: string, mediaArr: media[]): number {
  let result: number = Infinity;
  // media.forEach((item: test) => item[key] && item[key] < result ? undefined : result = item[key])
  console.log(mediaArr, 'FROM MODULE')
  mediaArr.forEach((item: test) => {
    if (item[key] && item[key] < result) {
      result = item[key]
    }
  })
  return result;
}

export function getMaxValue(key: string, mediaArr: media[]): number {
  let result: number = -Infinity;
  mediaArr.forEach((item: test) => {
    if (item[key] && item[key] > result) {
      result = item[key];
    }
  })
  return result;
}

export function getUnqValues(key: string, mediaArr: media[]): (string | null)[] {
  let result: (string | null)[] = [];
  mediaArr.forEach((item: test) => {
    if (!result.includes(item[key])) {
      result.push(item[key])
    }
  })
  return result.sort();
}
