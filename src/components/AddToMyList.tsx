'use client';

export default function AddToMyList(props: any) {
  async function addToList(e: any) {
    // we need to fetch to an api endpoint to post data
    e.preventDefault();
    // console.log(e.target.imdbId.value)
    const res = await fetch('/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imdbId: props.imdbId, userId: props.userId })
    })
    console.log(res);
  }

  // IF THIS MOVIE ALREADY EXISTS IN THE USER'S LIST
  // Then disable the button and change it to say something like 'Movie Already in List'

  // async function movieAlreadyInList() {
  //   // const res = await fetch('/api/', {
  //   //   method: 'GET',
  //   //   headers: {
  //   //     'Content-Type': 'application/json',
  //   //   },
  //   //   body: JSON.stringify({ test: 'This is a test' })
  //   // })
  //   const res = await fetch('/api')
  //   console.log(res);
  // }

  // movieAlreadyInList();


  // <input type='hidden' name='imdbId' value={props.imdbId}/>
  // <input type='hidden' name='userId' value={props.userId}/>

  return (
    <div>
      THIS IS THE ADD TO LIST COMPONENT
      <form onSubmit={addToList}>
        <button>ADD TO MY LIST</button>
      </form>
    </div>
  )
}
