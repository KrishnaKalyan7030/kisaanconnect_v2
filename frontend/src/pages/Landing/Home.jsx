// import ProductCard from "../../components/product/ProductCard";

// const products = [

//     {
//         id:1,
//         name:"Tomato",
//         price:30
//     },

//     {
//         id:2,
//         name:"Potato",
//         price:25
//     },

//     {
//         id:3,
//         name:"Onion",
//         price:40
//     }

// ];

// function Home(){

//     return(

//         <div className="p-10">

//             <h1 className="text-4xl font-bold mb-6">

//                 Products

//             </h1>

//             <div className="space-y-4">

//             {

//                 products.map(product=>(

//                     <ProductCard
//                         key={product.id}
//                         product={product}
//                     />

//                 ))

//             }

//             </div>

//         </div>

//     );

// }


// export default Home;

// import Auth from "../Auth/Login"

// import { useState } from "react";
// function Home() {

//     console.log("Render");

//     const [count, setCount] = useState(0);

//     return (
//         <>
//             <h1>{count}</h1>

//             <Auth/>

//             <button
//   onClick={() => {
//     setCount(prev => prev + 1);
//     setCount(prev => prev + 1);
//   }}
// >
//   Increase
// </button>
//         </>
//     );
// }
// export default Home;






// ===================
import Auth from "../Auth/Login" ;

function Home(){
  return (
    <Auth/>
  )
}

export default Home;