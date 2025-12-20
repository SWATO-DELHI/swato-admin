import Image from 'next/image';
import Link from 'next/link';

const foodImages = [
  'Biryani.avif', 'Bonda.avif', 'Cake.avif', 'Chole Bhature.avif',
  'Dosa.avif', 'Idli.avif', 'Juice.avif', 'Khichdi.avif',
  'Pancake.avif', 'Paratha.avif', 'Pav Bhaji.avif', 'Poha-1.avif',
  'Poha.avif', 'Poori.avif', 'Salad.avif', 'Shake.avif',
  'Tea.avif', 'Upma.avif', 'Uthappam.avif', 'Vada.avif'
];

// Helper function to get food name from image filename
const getFoodName = (imageName: string) => {
  return imageName.replace('.avif', '').replace('-', ' ').replace('1', '');
};

export function FoodCategories() {

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #F2521B 0%, #FF7A32 50%, #FFD7B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            What's on your mind?
          </h2>
        </div>

        {/* Food Images Grid - All 20 images displayed */}
        <div className="px-2 sm:px-4">
          <div className="space-y-6 lg:space-y-8">
            {/* First Row - 10 images */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3 md:gap-4">
              {foodImages.slice(0, 10).map((imageName, index) => {
                const foodName = getFoodName(imageName);
                return (
                  <Link
                    key={`row1-${imageName}-${index}`}
                    href={`/restaurants?food=${encodeURIComponent(foodName)}`}
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    <div className="w-full aspect-square relative rounded-full overflow-hidden shadow-lg hover:shadow-xl cursor-pointer">
                      <Image
                        src={`/assets/images/food/${imageName}`}
                        alt={foodName}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Second Row - 10 images */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3 md:gap-4">
              {foodImages.slice(10, 20).map((imageName, index) => {
                const foodName = getFoodName(imageName);
                return (
                  <Link
                    key={`row2-${imageName}-${index}`}
                    href={`/restaurants?food=${encodeURIComponent(foodName)}`}
                    className="transition-transform duration-300 hover:scale-105"
                  >
                    <div className="w-full aspect-square relative rounded-full overflow-hidden shadow-lg hover:shadow-xl cursor-pointer">
                      <Image
                        src={`/assets/images/food/${imageName}`}
                        alt={foodName}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
