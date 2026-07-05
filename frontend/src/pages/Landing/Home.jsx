const fruits = [
  "Tomato",
  "Potato",
  "Onion",
  "Carrot",
  "Brinjal"
];

function Home() {

  return (

    <div className="p-10">

      <h1 className="text-4xl font-bold mb-6">
        Fresh Products
      </h1>

      {

        fruits.map(function(fruit){

          return(

            <div className="border p-4 rounded-lg mb-3">

                {fruit}

            </div>

          );

        })

      }

    </div>

  );

}

export default Home;