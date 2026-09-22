// Menú de Kura Coffee Garden. Precios en colones (₡).
// Para precios por tamaño usa `sizes`; para un solo precio usa `price`.

export const restaurant = {
  name: 'Kura',
  tagline: 'Coffee Garden',
  phone: '84490915',
}

export const menu = [
  {
    id: 'para-empezar',
    title: 'Para empezar',
    items: [
      { name: 'Focaccia', price: 3800 },
      { name: 'Hummus', price: 4000 },
      { name: 'Ceviche', price: 5000 },
      { name: 'Ensalada Capresse', price: 5600 },
    ],
  },
  {
    id: 'pizzas',
    title: 'Pizzas',
    items: [
      {
        name: 'Kura',
        price: 7800,
        description:
          'Pizza con pepperoni crujiente, hongos salteados y cebolla morada caramelizada, coronada con tomates cherry confitados y un toque de aceitunas mediterráneas.',
      },
      {
        name: 'Parma',
        price: 7800,
        description:
          'Prosciutto fino sobre una base ligera, acompañado de rúgula fresca y el toque justo de parmesano.',
      },
      {
        name: 'Margarita',
        price: 7200,
        description:
          'Clásica combinación de tomate fresco, queso mozzarella y albahaca del jardín.',
      },
      {
        name: 'Cuatro Quesos',
        price: 8000,
        description:
          'Equilibrio ideal entre queso mozzarella, gorgonzola, queso azul y parmesano, un clásico que nunca falla.',
      },
    ],
  },
  {
    id: 'principales',
    title: 'Principales',
    items: [
      { name: 'Salmón', detail: '300 g', price: 10900 },
      { name: 'Ribeye', detail: '350 g · Brangus', price: 14500 },
      { name: 'New York', detail: '350 g · Brangus', price: 12500 },
      { name: 'Churrasco', detail: '350 g · Brangus', price: 12500 },
      { name: 'Pollo gratinado', price: 6500 },
    ],
    sides: {
      label: 'Dos acompañamientos a elegir entre:',
      options: ['Papas al romero', 'Vegetales salteados', 'Ensalada de la casa'],
    },
  },
  {
    id: 'bebidas-calientes',
    title: 'Bebidas calientes',
    items: [
      { name: 'Espresso', price: 1500 },
      { name: 'Latte', detail: '12 oz', price: 1850 },
      { name: 'Chai', price: 2000 },
      {
        name: 'Americano',
        sizes: [
          { label: '7 oz', price: 1400 },
          { label: '10 oz', price: 1800 },
        ],
      },
      { name: 'Mocha', detail: '12 oz', price: 2100 },
      { name: 'Dirty Chai', detail: '10 oz', price: 2500 },
      {
        name: 'Cappuccino',
        sizes: [
          { label: '7 oz', price: 1800 },
          { label: '10 oz', price: 2200 },
        ],
      },
      { name: 'Filtrado', price: 1500 },
      { name: 'Chocolate', price: 2000 },
    ],
  },
  {
    id: 'bebidas-frias',
    title: 'Bebidas frías',
    items: [
      { name: 'Latte', price: 1800 },
      { name: 'Chocolate', price: 2000 },
      { name: 'Frappuccino', price: 3300 },
      { name: 'Cold Brew', price: 1700 },
      { name: 'Mocha', price: 2500 },
      { name: 'Chai', price: 2000 },
      { name: 'Dirty Chai', price: 2500 },
    ],
  },
  {
    id: 'smoothies',
    title: 'Smoothies',
    items: [
      { name: 'Frutos rojos', price: 1800 },
      { name: 'Pitahaya limón', price: 1800 },
      { name: 'Limonada hierbabuena', price: 1800 },
      { name: 'Té frío Kura', price: 1800 },
    ],
  },
  {
    id: 'paninis-tostadas',
    title: 'Paninis y tostadas',
    note: 'Disponible en pan brioche y masa madre',
    items: [
      { name: '4 Quesos', price: 4600 },
      { name: 'Panini de pollo al pesto', price: 5000 },
      { name: 'Panini de lomito', price: 5500 },
      // Los siguientes precios estaban cortados en la foto: verificar
      { name: 'Tostadas caprese', price: 4800 },
      { name: 'Tostadas de salmón', price: 4800 },
      { name: 'Tostadas de atún fresco', price: 4500 },
      { name: 'Tostadas de Nutella', price: 3500 },
    ],
  },
]
