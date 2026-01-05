import { ArrowRight } from "lucide-react";
import {motion} from "motion/react"
export const CarGrid = () => {
  const cars = [
    {
      name: "Lamborghini Urus",
      category: "Luxury SUV",
      price: "$1,500",
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80"
    },
    {
      name: "Ferrari 488 Pista",
      category: "Supercar",
      price: "$1,650",
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80"
    },
    {
      name: "Rolls-Royce Ghost",
      category: "Executive",
      price: "$2,000",
      image: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80"
    },
    {
      name: "Porsche Taycan",
      category: "Electric Sport",
      price: "$950",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80"
    }
  ];

  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-end mb-12"
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Premium Selection</h2>
            <p className="text-slate-500">Curated for the ultimate driving experience.</p>
          </div>
          <a href="#" className="hidden md:flex items-center gap-2 text-amber-600 font-semibold hover:gap-3 transition-all">
            View All Cars <ArrowRight size={18} />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cars.map((car, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                  {car.price}<span className="text-slate-500 font-normal">/day</span>
                </div>
                <img 
                  src={car.image} 
                  alt={car.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-6">
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-2">{car.category}</p>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{car.name}</h3>
                <button className="w-full py-3 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-900 hover:text-white hover:border-transparent transition-all">
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};