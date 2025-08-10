export type TypeMap = {
  string: string,
  number: number,
  boolean: boolean,
}

export type ParamTypes = keyof TypeMap

export type ParamConfig = {
  type: ParamTypes,
  validator?: string,
  required?: boolean,
}

export type InferredParams<T extends Record<string, ParamConfig>> = {
  [K in keyof T]: T[K]['required'] extends true ? TypeMap[T[K]['type']]
    : TypeMap[T[K]['type']] | undefined
}

export type DbArgs<P extends Record<string, ParamConfig> = {}> = {
  body?: any,
  params?: InferredParams<P>,
}

export type ExtraKeys = (string | number)[]
