'use client';
// import { signIn } from 'next-auth/react';

export default function Login() {
  async function formHandler(e: any) {
    e.preventDefault();
    // console.log(e)
    console.log(e.target.username.value)
    console.log(e.target.password.value)
    const username = e.target.username.value;
    const password = e.target.password.value;
    const result = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
    })
    console.log(result)
    // if login fails, send errors to client
    //    - Username not found
    //    - Username correct, but password wrong
  }

  return (
    <div>
      <h1>Login Page</h1>

      {/* <form action='/api' >  */}
      <form onSubmit={formHandler} >
        <label htmlFor='username'>Username</label>
        <input name='username' className='border-8' type='username' />

        <label htmlFor='password'>Password</label>
        <input name='password' className='border-8' type='password' />

        <button>Login</button>
      </form>
    </div>
  )
}
