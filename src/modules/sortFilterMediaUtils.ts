import { strIdxMedia } from "@/types";

export function getMinValue(key: string, mediaArr: strIdxMedia[]): number {
  let result: number = Infinity;
  mediaArr.forEach((item: strIdxMedia) => {
    item[key] && item[key] < result ? result = item[key] : undefined;
  })
  return result;
}

export function getMaxValue(key: string, mediaArr: strIdxMedia[]): number {
  let result: number = -Infinity;
  mediaArr.forEach((item: strIdxMedia) => {
    item[key] && item[key] > result ? result = item[key] : undefined;
  })
  return result;
}

export function getUnqValues(key: string, mediaArr: strIdxMedia[]): (string | null)[] {
  let result: (string | null)[] = [];
  mediaArr.forEach((item: strIdxMedia) => {
    !result.includes(item[key]) ? result.push(item[key]) : undefined
  })
  return result.sort();
}
