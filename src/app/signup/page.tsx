export default function Login() {
  return (
    <div>
      <h1>Sign-Up</h1>

      <form method='POST' action=''>
        <label>E-mail</label>
        <input className='border-8' type='email' />

        <label>Username</label>
        <input className='border-8' type='text' />

        <label>Password</label>
        <input className='border-8' type='password' />

        <label>Confirm Password</label>
        <input className='border-8' type='password' />

        <button>Create Account</button>
      </form>
    </div>
  )
}
