export default function getTypedKeys<
  T extends { [key: string]: any }
>(obj: T) {
  return Object.keys(obj) as (keyof T)[]
}
