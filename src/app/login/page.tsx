'use client';
import { signIn } from 'next-auth/react';

export default function Login() {
  async function formHandler(e: any) {
    e.preventDefault();
    console.log(e)
    console.log(e.target.username.value)
    console.log(e.target.password.value)

    const username = e.target.username.value;
    const password = e.target.password.value;

    const result = await signIn('Credentials', { username, password , redirect: false })
    console.log(result)
    // const result = { username, password, error: undefined }
    
    if (result?.error) {
      console.log('WRONG')
    } else {
      console.log('WINNER')
    }
  }

  return (
    <div>
      <h1>Login Page</h1>

      <form method='POST' action='api/auth/signin'>
        <label htmlFor='username'>Username</label>
        <input name='username' className='border-8' type='username' />

        <label htmlFor='password'>Password</label>
        <input name='password' className='border-8' type='password' />

        <button>Login</button>
      </form>
    </div>
  )
}
