'use client';
import { useState } from 'react';

export default function Signup() {
  const [errors, setErrors]= useState<Array<string>>([]);

  async function signUpHandler(e: any) {
    e.preventDefault();
    // console.log(e);
    // SANITIZE AND VALIDATE
    // Need to check for: 
    //    existing username, 
    //    existing email,
    //    matching password, 
    //    password contains at leat 1 capital and one special character
    // Existing username/password will probably need to fetch from their own routes
    // Each route should simply return true or false, true of it exists, false if it does not exist

    const currentErrors = [];
    const emailIsTaken = await fetch('/api/user/check/email', { 
      method: 'POST',
      headers: {
        'Content-Type': 'Application/json',
      },
      body: JSON.stringify({ email: e.target.email.value })
    })
    const usernameIsTaken = await fetch('/api/user/check/username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: e.target.username.value })
    })
    if (await emailIsTaken.json()) {
      currentErrors.push('This Email is already in use!')
    }

    if (await usernameIsTaken.json()) {
      currentErrors.push('This Username is already in use!')
    }

    if (e.target.password.value !== e.target.passwordConfirm.value) {
      currentErrors.push('Passwords do not match, try again')
    }

    if (currentErrors.length > 0) {
      setErrors(currentErrors);
      return;
    } else {
      setErrors([]);
    }

    // If the data passes all the requirements, create a new user
    const newUserData = {
      email: e.target.email.value,
      username: e.target.username.value,
      password: e.target.password.value,
      passwordConfirm: e.target.passwordConfirm.value,
    }
    console.log(newUserData)
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/json'
      },
      body: JSON.stringify(newUserData),
    }

    const response = await fetch('/api/user/signup', fetchOptions)
    if (response.ok) {
      const result = await response.json();
      console.log(result)
    } else {
      console.log('API/DATABASE ERROR')
      console.log(response)
    }
  }

  return (
    <div>
      <h1>Sign-Up</h1>

      <form onSubmit={signUpHandler} >
        <label htmlFor='email'>E-mail</label>
        <input className='border-8'
          name='email'
          type='email'
          required
        />

        <label htmlFor='username'>Username</label>
        <input className='border-8'
          name='username'
          type='text' 
          required
        />

        <label htmlFor='password'>Password</label>
        <input className='border-8'
          name='password'
          type='password'
          required
          minLength={8}
        />

        <label htmlFor='passwordConfirm'>Confirm Password</label>
        <input className='border-8'
          name='passwordConfirm'
          type='password'
          required
          minLength={8}
        />

        <button>Create Account</button>
      </form>
      {errors.map((error: any, index: number) => {
        return (
          <p key={index}>{error}</p>
        )
      })}
    </div>
  )
}
