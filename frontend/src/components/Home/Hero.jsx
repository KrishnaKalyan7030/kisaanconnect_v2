function Hero({title,subtitle}) {
  return (
    <section className="bg-green-100 p-10 rounded-xl">
      <h1 className="text-4xl font-bold">
        {title}
      </h1>

      <p className="mt-3 text-gray-700">
        {subtitle}
      </p>
    </section>
  );
}

export default Hero;