type Validators = {
  maxLength: number,
  required: boolean | undefined,
  min: number,
  max: number,
  values: any[],
}

// type ValidatorObj = { [K in keyof Validators]?: Validators[K] }
type ValidatorObj = Partial<Validators>

type ValidationTests = {
  [K in keyof Validators]: (val: string | number, constraint: Validators[K]) => boolean
}

type InputValidation = { [key: string]: ValidatorObj }

const required = true
export const inputValidation: InputValidation = {
  listname: { maxLength: 32, required },
  review: { maxLength: 256 },
  rating: { min: 0, max: 100 },
  watchAgain: { values: [true, null, false] },
}

const validationTests: ValidationTests = {
  maxLength: (val, constraint) => !!val && val.toString().length <= constraint,
  min: (val, constraint) => Number(val) >= constraint,
  max: (val, constraint) => Number(val) <= constraint,
  values: (val, constraints) => constraints.includes(val),
  required: (val) => val !== undefined,
}

// rethink this, kinda seems like fields that arent required dont even get checked
export function isValid(inputObj: { [key: string]: any }) {
  return Object.keys(inputObj).every(inputKey => {
    const validators = inputValidation[inputKey];
    if (!validators) return true; // no validators then assume true

    return (Object.keys(validators) as (keyof ValidatorObj)[])
      .every(constraintType => {
        const testFn = validationTests[constraintType];
        const constraint  = validators[constraintType];
        return testFn(inputObj[inputKey], constraint as never);
      });
  });

  // return Object.entries(inputObj).every(([inputKey, inputVal]) => {
  //   const validators = inputValidation[inputKey];
  //   if (!validators) return true; // no validators then assume true
  //   return (Object.entries(validators) as [keyof Validators, Validators[keyof Validators]][])
  //     .every(([constraintKey, constraintVal]) => {
  //       const testFn = validationTests[constraintKey]
  //       return testFn(inputVal, constraintVal)
  //     })
  // })
}

// WORKING
// interface InputValidation {
//   [key: string]: { [key: string]: boolean | number }
// }
// 
// const required = true
// export const inputValidation: InputValidation = {
//   listname: { maxLength: 32, required },
//   review: { maxLength: 256 },
//   rating: { min: 0, max: 100 },
// }
// 
// const validationTests: { [key: string]: (val: string | number, constraint: any) => boolean } = {
//   maxLength: (val, constraint) => !!val && val.toString().length <= constraint,
//   min: (val, constraint) => val >= constraint,
//   max: (val, constraint) => val <= constraint,
// }
// 
// export function isValid(inputObj: { [key: string]: any }) {
//   return Object.keys(inputObj).every(input => {
//     if (!inputValidation[input]) return true
// 
//     const constraints = Object.keys(inputValidation[input])
// 
//     if (!constraints.includes('required') && !inputObj[input]) {
//       return true
//     }
//     
//     return constraints
//       .filter(constraint => constraint !== 'required')
//       .every(constraintType => {
//         return validationTests[constraintType](
//           inputObj[input],
//           inputValidation[input][constraintType],
//         )
//       })
//   })
// }
