'use client';

export default function Signup() {
  async function signUpHandler(e: any) {
    e.preventDefault();
    console.log(e);
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
    const response = await fetch('/api', fetchOptions)
    const result = await response.json();
    console.log(result)

  }

  return (
    <div>
      <h1>Sign-Up</h1>

      <form onSubmit={signUpHandler} >
        <label htmlFor='email'>E-mail</label>
        <input className='border-8'
          name='email'
          type='email'
        />

        <label htmlFor='username'>Username</label>
        <input className='border-8'
          name='username'
          type='text' 
        />

        <label htmlFor='password'>Password</label>
        <input className='border-8'
          name='password'
          type='password'
        />

        <label htmlFor='passwordConfirm'>Confirm Password</label>
        <input className='border-8'
          name='passwordConfirm'
          type='password'
        />

        <button>Create Account</button>
      </form>
    </div>
  )
}
