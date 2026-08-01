import { Hero } from "@/components/home/Hero";
import { CategoryTeaser } from "@/components/home/CategoryTeaser";
import { getCategories, getHeroSettings } from "@/lib/data";

export default async function HomePage() {
  const [categories, hero] = await Promise.all([
    getCategories(),
    getHeroSettings(),
  ]);

  return (
    <>
      <div className="-mt-16">
        <Hero
          heading={hero.heading}
          subheading={hero.subheading}
          image={hero.image}
          imageMobile={hero.imageMobile}
        />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 pb-2 pt-16 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            The Collection
          </p>
          <h2 className="mt-3 font-serif text-3xl text-black sm:text-4xl">
            Shop by Category
          </h2>
        </div>
        {categories.map((category, index) => (
          <CategoryTeaser
            key={category.slug}
            category={category}
            reverse={index % 2 === 1}
          />
        ))}
      </div>
    </>
  );
}
