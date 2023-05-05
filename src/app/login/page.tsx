export default function Login() {
  // function formHandler(e: any) {
  //   console.log(e)
  // }

  return (
    <div>
      <h1>Login Page</h1>

      <form method='POST' action=''>
        <label>Username</label>
        <input className='border-8' type='text' />

        <label>Password</label>
        <input className='border-8' type='password' />

        <button>Login</button>
      </form>
    </div>
  )
}
