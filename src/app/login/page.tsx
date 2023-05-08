'use client';
// import { signIn } from 'next-auth/react';

export default function Login() {
  async function formHandler(e: any) {
    e.preventDefault();
    // console.log(e)
    console.log(e.target.username.value)
    console.log(e.target.password.value)

    // const username = e.target.username.value;
    // const password = e.target.password.value;
    const test = await fetch('/test')
    const result = await test.json();
    console.log(result);
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
