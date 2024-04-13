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
  // required: (val) => !!val || val === 0,
  maxLength: (val, constraint) => {
    console.log(val, !!val)
    return !!val && val.toString().length <= constraint
  },
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
        console.log(input, constraintType)
        return validationTests[constraintType](
          inputObj[input],
          inputValidation[input][constraintType],
        )
      })
  })
}

console.log('TESTING')
console.log(
  isValid({
    // listname: ';lkajsdf;lkajsdl;fkajsd;flkjasdflkajsdlfkjasdlfkja;sdlkfjas;ldkfja;slkdfj;asldkfj;asldkfja;sldkfj;alskdjf',
    listname: 'hello',
    review: null,
    rating: 0,
  })
)
