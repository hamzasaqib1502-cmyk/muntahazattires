import Image from "next/image";

export function Hero({
  heading = "Elegance in Every Thread",
  subheading = "Stitched, unstitched, co-ords, and more — curated for the modern Pakistani woman.",
  image = "/images/hero.jpg",
  imageMobile = "/images/hero.jpg",
}: {
  heading?: string;
  subheading?: string;
  image?: string;
  imageMobile?: string;
}) {
  return (
    <section className="relative flex min-h-screen items-end justify-center overflow-hidden bg-gray-900 sm:items-center">
      <Image
        src={imageMobile}
        alt="Muntaha's Attires — traditional Pakistani clothing"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top md:hidden"
      />
      <Image
        src={image}
        alt="Muntaha's Attires — traditional Pakistani clothing"
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-top md:block"
      />
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center text-white sm:px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-200">
          Traditional Pakistani Clothing
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
          {heading}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-200 sm:text-lg">
          {subheading}
        </p>
      </div>
    </section>
  );
}
