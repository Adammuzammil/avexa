export const featuredCars = [
  {
    id: 1,
    maker: "Mercedes-Benz",
    model: "GLE 43 AMG Coupe",
    year: 2019,
    price: "₹ 88,00,000 – ₹ 1,10,00,000",
    transmission: "Automatic",
    fuelType: "Petrol",
    bodyType: "Coupe SUV",
    mileage: "8–10 km/l",
    color: "Polar White",
    images: ["/merc.jpg"],
    wishlisted: true,
  },
  {
    id: 2,
    maker: "Honda",
    model: "CR-V",
    year: 2017,
    price: "₹ 30,00,000 – ₹ 34,00,000",
    transmission: "CVT / Automatic",
    fuelType: "Petrol",
    bodyType: "SUV",
    mileage: "12–15 km/l",
    color: "Orchid White Pearl",
    images: ["/honda.jpg"],
    wishlisted: false,
  },
  {
    id: 3,
    maker: "Ford",
    model: "Expedition",
    year: 2020,
    price: "₹ 80,00,000+ (Import)",
    transmission: "10-Speed Automatic",
    fuelType: "Petrol (EcoBoost V6)",
    bodyType: "Full-size SUV",
    mileage: "7–9 km/l",
    color: "Oxford White",
    images: ["/ford.jpg"],
    wishlisted: true,
  },
  {
    id: 4,
    maker: "BMW",
    model: "M4 Coupe (F82)",
    year: 2018,
    price: "₹ 1,40,00,000+",
    transmission: "7-Speed DCT / Manual",
    fuelType: "Petrol",
    bodyType: "Sports Coupe",
    mileage: "8–10 km/l",
    color: "Mineral Grey Metallic",
    images: ["/bmw.jpg"],
    wishlisted: false,
  },
];

export const carMakes = [
  { id: 1, name: "Hyundai", image: "/make/hyundai.webp" },
  { id: 2, name: "Honda", image: "/make/honda.webp" },
  { id: 3, name: "BMW", image: "/make/bmw.webp" },
  { id: 4, name: "Tata", image: "/make/tata.webp" },
  { id: 5, name: "Mahindra", image: "/make/mahindra.webp" },
  { id: 6, name: "Ford", image: "/make/ford.webp" },
];

export const bodyTypes = [
  { id: 1, name: "SUV", image: "/body/suv.webp" },
  { id: 2, name: "Sedan", image: "/body/sedan.webp" },
  { id: 3, name: "Hatchback", image: "/body/hatchback.webp" },
  { id: 4, name: "Convertible", image: "/body/convertible.webp" },
];

export const faqItems = [
  {
    question: "How does the test drive booking work?",
    answer:
      "Simply find a car you're interested in, click the 'Test Drive' button, and select an available time slot. Our system will confirm your booking and provide all necessary details.",
  },
  {
    question: "Can I search for cars using an image?",
    answer:
      "Yes! Our AI-powered image search lets you upload a photo of a car you like, and we'll find similar models in our inventory.",
  },
  {
    question: "Are all cars certified and verified?",
    answer:
      "All cars listed on our platform undergo a verification process. We are a trusted dealerships and verified private seller.",
  },
  {
    question: "What happens after I book a test drive?",
    answer:
      "After booking, you'll receive a confirmation email with all the details. We will also contact you to confirm and provide any additional information.",
  },
];
