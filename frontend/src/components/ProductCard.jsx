const FALLBACK_IMG = "https://picsum.photos/id/1015/400/300";

export default function ProductCard({ product, onClick, showQty = false }) {
  return (
    <div
      onClick={onClick}
      className="product-card bg-white rounded-3xl overflow-hidden shadow-sm cursor-pointer"
    >
      <img
        src={product.image_url || FALLBACK_IMG}
        className="w-full h-40 sm:h-48 object-cover"
        onError={(e) => {
          e.target.src = FALLBACK_IMG;
        }}
        alt={product.name}
      />
      <div className="p-4">
        <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{product.name}</h3>
        <p className="text-emerald-600 font-bold text-xl mt-2">₹{product.price}/kg</p>
        {showQty && <p className="text-gray-500 text-sm mt-1">{product.quantity || "N/A"} kg</p>}
      </div>
    </div>
  );
}
