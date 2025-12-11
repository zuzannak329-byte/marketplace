import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, writeBatch, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const products = [
  {
    id: 1,
    name: 'Apple iPhone 14 Pro Max 128GB Deep Purple',
    price: 2900,
    oldPrice: 3200,
    image: 'assets/img/products/iphone-14-pro-max-deep-purple.png',
    images: [
      'assets/img/products/iphone-14-pro-max-deep-purple.png',
      'assets/img/product-page/image-57.png',
      'assets/img/product-page/image-61-51b21e.png',
      'assets/img/product-page/image-62-615a5a.png',
      'assets/img/product-page/image-63-49f9fe.png'
    ],
    category: 'Phones',
    popular: true,
    description: 'Enhanced capabilities thanks to an enlarged display of 6.7 inches and work without recharging throughout the day. Incredible photos in weak and bright light using the new system with two cameras.',
    specs: {
      screenSize: '6.7"',
      cpu: 'Apple A16 Bionic',
      cores: '6',
      mainCamera: '48-12-12 MP',
      frontCamera: '12 MP',
      battery: '4323 mAh'
    }
  },
  {
    id: 2,
    name: 'Blackmagic Pocket Cinema Camera 6k',
    price: 8100,
    oldPrice: 8500,
    image: 'assets/img/products/blackmagic-camera.png',
    images: [
      'assets/img/products/blackmagic-camera.png'
    ],
    category: 'Cameras',
    popular: true,
    description: 'Professional cinema camera with 6K Super 35 sensor, 13 stops of dynamic range, and dual native ISO up to 25,600 for incredible low light performance.',
    specs: {
      screenSize: '5"',
      cpu: 'Blackmagic',
      cores: '-',
      mainCamera: '6K',
      frontCamera: '-',
      battery: '2 hours'
    }
  },
  {
    id: 3,
    name: 'Apple Watch Series 9 GPS 41mm Starlight Aluminium',
    price: 1280,
    oldPrice: 1450,
    image: 'assets/img/products/apple-watch-series-9-starlight.png',
    images: [
      'assets/img/products/apple-watch-series-9-starlight.png'
    ],
    category: 'Smart Watches',
    popular: true,
    description: 'The ultimate device for a healthy life. Apple Watch Series 9 helps you stay connected, active, healthy, and safe.',
    specs: {
      screenSize: '41mm',
      cpu: 'Apple S9',
      cores: '2',
      mainCamera: '-',
      frontCamera: '-',
      battery: '18 hours'
    }
  },
  {
    id: 4,
    name: 'AirPods Max Silver Starlight Aluminium',
    price: 1760,
    oldPrice: 1950,
    image: 'assets/img/products/airpods-max-silver.png',
    images: [
      'assets/img/products/airpods-max-silver.png'
    ],
    category: 'Headphones',
    popular: true,
    description: 'AirPods Max combine high-fidelity audio with industry-leading Active Noise Cancellation, Transparency mode, and spatial audio.',
    specs: {
      screenSize: '-',
      cpu: 'Apple H1',
      cores: '-',
      mainCamera: '-',
      frontCamera: '-',
      battery: '20 hours'
    }
  },
  {
    id: 5,
    name: 'Samsung Galaxy Watch6 Classic 47mm Black',
    price: 1180,
    oldPrice: 1300,
    image: 'assets/img/products/samsung-galaxy-watch6.png',
    images: [
      'assets/img/products/samsung-galaxy-watch6.png'
    ],
    category: 'Smart Watches',
    popular: true,
    description: 'Galaxy Watch6 Classic with rotating bezel, advanced health monitoring, and Wear OS powered by Samsung.',
    specs: {
      screenSize: '47mm',
      cpu: 'Exynos W930',
      cores: '2',
      mainCamera: '-',
      frontCamera: '-',
      battery: '40 hours'
    }
  },
  {
    id: 6,
    name: 'Galaxy Z Fold5 Unlocked | 256GB | Phantom Black',
    price: 5760,
    oldPrice: 6200,
    image: 'assets/img/products/galaxy-z-fold5.png',
    images: [
      'assets/img/products/galaxy-z-fold5.png'
    ],
    category: 'Phones',
    popular: true,
    description: 'The ultimate foldable experience. Galaxy Z Fold5 with Flex Mode, multitasking capabilities, and stunning 7.6" display.',
    specs: {
      screenSize: '7.6"',
      cpu: 'Snapdragon 8 Gen 2',
      cores: '8',
      mainCamera: '50-12-10 MP',
      frontCamera: '10 MP',
      battery: '4400 mAh'
    }
  },
  {
    id: 7,
    name: 'Galaxy Buds FE Graphite',
    price: 320,
    oldPrice: 380,
    image: 'assets/img/products/galaxy-buds-fe.png',
    images: [
      'assets/img/products/galaxy-buds-fe.png'
    ],
    category: 'Headphones',
    popular: true,
    description: 'Galaxy Buds FE with Active Noise Cancellation, comfortable fit, and powerful sound in a compact design.',
    specs: {
      screenSize: '-',
      cpu: '-',
      cores: '-',
      mainCamera: '-',
      frontCamera: '-',
      battery: '8.5 hours'
    }
  },
  {
    id: 8,
    name: 'Apple iPad 9 10.2" 64GB Wi-Fi Silver (MK2L3) 2021',
    price: 1270,
    oldPrice: 1450,
    image: 'assets/img/products/apple-ipad-9.png',
    images: [
      'assets/img/products/apple-ipad-9.png'
    ],
    category: 'Computers',
    popular: true,
    description: 'The iPad you know and love, now with the powerful A13 Bionic chip, Center Stage, and True Tone display.',
    specs: {
      screenSize: '10.2"',
      cpu: 'Apple A13 Bionic',
      cores: '6',
      mainCamera: '8 MP',
      frontCamera: '12 MP',
      battery: '10 hours'
    }
  },
  {
    id: 9,
    name: 'Google Pixel 7 Pro 128GB Hazel',
    price: 3100,
    oldPrice: 3400,
    image: 'assets/img/products/google-pixel-7-pro.jpg',
    images: [
      'assets/img/products/google-pixel-7-pro.jpg',
      'assets/img/products/google-pixel-7-pro-side.jpg'
    ],
    category: 'Phones',
    popular: true,
    description: 'Google Pixel 7 Pro is Google’s best-of-everything phone. Powered by Google Tensor G2, it’s fast and secure, with an immersive display and amazing battery life.',
    specs: {
      screenSize: '6.7"',
      cpu: 'Google Tensor G2',
      cores: '8',
      mainCamera: '50-48-12 MP',
      frontCamera: '10.8 MP',
      battery: '5000 mAh'
    }
  },
  {
    id: 10,
    name: 'Canon EOS R5 Body',
    price: 11500,
    oldPrice: 12500,
    image: 'assets/img/products/canon-eos-r5.jpg',
    images: [
      'assets/img/products/canon-eos-r5.jpg',
      'assets/img/products/canon-eos-r5-back.jpg'
    ],
    category: 'Cameras',
    popular: true,
    description: 'The EOS R5 builds off the powerful legacy of Canon’s full frame cameras offering next generation refinements in image quality, performance and reliability.',
    specs: {
      screenSize: '3.2"',
      cpu: 'DIGIC X',
      cores: '-',
      mainCamera: '45 MP',
      frontCamera: '-',
      battery: 'LP-E6NH'
    }
  },
  {
    id: 11,
    name: 'Apple Watch Series 9 GPS 45mm Midnight',
    price: 1350,
    oldPrice: 1500,
    image: 'assets/img/products/apple-watch-series-9-new.jpg',
    images: [
      'assets/img/products/apple-watch-series-9-new.jpg',
      'assets/img/products/apple-watch-series-9-side.jpg'
    ],
    category: 'Smart Watches',
    popular: true,
    description: 'Smarter, brighter, and mightier. Apple Watch Series 9 helps you stay connected, active, healthy, and safe.',
    specs: {
      screenSize: '45mm',
      cpu: 'Apple S9',
      cores: '2',
      mainCamera: '-',
      frontCamera: '-',
      battery: '18 hours'
    }
  }
];

async function seedProducts() {
  const productsRef = collection(db, "products");
  
  // Проверяем, есть ли уже товары, чтобы не дублировать
  const snapshot = await getDocs(productsRef);
  if (!snapshot.empty) {
    console.log('Products collection is not empty. Skipping seed.');
    // alert('Товары уже есть в базе данных! Используйте reseedProducts() для обновления.');
    return;
  }

  const batch = writeBatch(db);

  products.forEach((product) => {
    const docRef = doc(productsRef); // Создаем новый документ с авто-ID
    batch.set(docRef, product);
  });

  try {
    await batch.commit();
    console.log('Products successfully added to Firestore!');
    // alert('Все товары успешно добавлены в базу данных!');
  } catch (error) {
    console.error('Error adding products: ', error);
    // alert('Ошибка при добавлении товаров: ' + error.message);
  }
}

// Функция для удаления всех товаров
async function deleteAllProducts() {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);
  
  if (snapshot.empty) {
    console.log('No products to delete.');
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  await batch.commit();
  console.log('All products deleted!');
}

// Функция для пересоздания всех товаров (удаление + добавление)
async function reseedProducts() {
  console.log('Deleting old products...');
  await deleteAllProducts();
  
  console.log('Adding new products...');
  const productsRef = collection(db, "products");
  const batch = writeBatch(db);

  products.forEach((product) => {
    const docRef = doc(productsRef);
    batch.set(docRef, product);
  });

  try {
    await batch.commit();
    console.log('Products successfully re-seeded to Firestore!');
    // alert('Товары успешно обновлены! Обновите страницу.');
  } catch (error) {
    console.error('Error re-seeding products: ', error);
    // alert('Ошибка: ' + error.message);
  }
}

// Экспортируем функции в глобальную область
window.seedProducts = seedProducts;
window.reseedProducts = reseedProducts;
window.deleteAllProducts = deleteAllProducts;
