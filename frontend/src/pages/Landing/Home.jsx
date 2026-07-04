
// function Home() {
//   return (
//     <div className="p-10">

//       <h1 className="text-4xl font-bold">
//         Home Page
//       </h1>

//     </div>
//   );
// }

// export default Home;





import HomeComponent from "../../components/Home/Home";
import Features from "../../components/Home/Features";
import CTA from "../../components/Home/CTA";

function Home() {
  return (
    <>
      <HomeComponent />
      <Features />
      <CTA />
    </>
  );
}

export default Home
