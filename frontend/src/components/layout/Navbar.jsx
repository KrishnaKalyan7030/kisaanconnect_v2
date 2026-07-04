import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-green-700 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between">

        <h1 className="font-bold text-xl">
          KisaanConnect
        </h1>

        <div className="space-x-5">

          <Link to="/">Home</Link>

          <Link to="/marketplace">
            Marketplace
          </Link>

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;