function ProductCard({ product }) {

    return (

        <div className="border rounded-xl p-5 shadow">

            <h2 className="text-xl font-bold">
                {product.name}
                {product.id}
            </h2>

            <p>
                ₹{product.price}/kg
            </p>

        </div>

    );

}

export default ProductCard;