export default function Greeting() {
    let animals= ["cat", "dog", "fish", "bird"];


  return (
    <>
    <div className="intro">
      <h1>Welcome to my website!</h1>
    </div>
    <p className="summary">
      You can find my thoughts here.
      <br/><br/>
      <b>And <i>pictures</i></b> of scientists!
    </p>
    <ul>
        {
            animals.map((animal)=> {
                return <li key={animal}>{animal}</li>
            })
        }
    </ul>

    
    </>
  );
}
