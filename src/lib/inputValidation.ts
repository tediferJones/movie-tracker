interface InputValidation {
  [key: string]: { [key: string]: boolean | number }
}

const required = true
export const inputValidation: InputValidation = {
  listname: { maxLength: 32, required },
  review: { maxLength: 256 },
  rating: { min: 0, max: 100 },
}

const validationTests: { [key: string]: (val: string | number, constraint: any) => boolean } = {
  maxLength: (val, constraint) => !!val && val.toString().length <= constraint,
  min: (val, constraint) => val >= constraint,
  max: (val, constraint) => val <= constraint,
}

export function isValid(inputObj: { [key: string]: any }) {
  return Object.keys(inputObj).every(input => {
    if (!inputValidation[input]) return true

    const constraints = Object.keys(inputValidation[input])

    if (!constraints.includes('required') && !inputObj[input]) {
      return true
    }
    
    return constraints
      .filter(constraint => constraint !== 'required')
      .every(constraintType => {
        return validationTests[constraintType](
          inputObj[input],
          inputValidation[input][constraintType],
        )
      })
  })
}
