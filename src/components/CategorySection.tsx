const CategorySection = () => {
  const categoryFruits = "/assets/category-fruits.jpg";
  const categoryVegetables = "/assets/category-vegetables.jpg";
  const categoryJuices = "/assets/category-juices.jpg";

  const categories = [
    { name: "Fresh Fruits", image: categoryFruits, count: 24, emoji: "🍎" },
    { name: "Vegetables", image: categoryVegetables, count: 32, emoji: "🥦" },
    { name: "Organic Juices", image: categoryJuices, count: 15, emoji: "🧃" },
    { name: "Dairy & Eggs", image: categoryFruits, count: 18, emoji: "🥚" },
    { name: "Honey & Jams", image: categoryJuices, count: 12, emoji: "🍯" },
    {
      name: "Herbs & Spices",
      image: categoryVegetables,
      count: 20,
      emoji: "🌿",
    },
  ];

  return (
    <section id="categories" className="py-12 md:py-16 bg-muted/50">
      <div className="container">
        <h2 className="section-heading">Shop by Category</h2>
        <p className="section-subheading">
          Browse our wide range of organic categories
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href="#"
              className="group bg-card rounded-xl border border-border p-4 text-center hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-accent mb-3 group-hover:scale-110 transition-transform duration-300">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-foreground text-sm">
                {cat.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                {cat.count} Products
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
