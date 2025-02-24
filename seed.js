require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

const books = [
    {
        title: "1984",
        author: "Джордж Оруэлл",
        description: "Антиутопия о тоталитарном обществе",
        price: 2500,
        category: "Антиутопия",
        imageUrl: "https://m.media-amazon.com/images/I/81StSOpmkjL._AC_UF1000,1000_QL80_.jpg"
    },
    {
        title: "Мастер и Маргарита",
        author: "Михаил Булгаков",
        description: "Мистический роман о добре и зле",
        price: 3000,
        category: "Классика",
        imageUrl: "https://cdn1.ozone.ru/s3/multimedia-x/6597669093.jpg"
    },
    {
        title: "Гарри Поттер и философский камень",
        author: "Дж. К. Роулинг",
        description: "Первая книга о приключениях Гарри Поттера",
        price: 3500,
        category: "Фэнтези",
        imageUrl: "https://m.media-amazon.com/images/I/51UoqRAxwEL._SY445_SX342_.jpg"
    },
    {
        title: "Война и мир",
        author: "Лев Толстой",
        description: "Эпический роман о войне и жизни в России",
        price: 2800,
        category: "Классика",
        imageUrl: "https://yandex-images.clstorage.net/nKV99D337/e7c8f6py/bavVPf6g0ALrNCVs258SpHwshPcXs1O0ObxbLEkBx4KX-7H-DE4g89QQHzVNLqzo7PDbMvXTnUFt2q5vPf4aUwif0Hnr5MXmmzR0KGs70wS9LdA2w4IHlan8LryJV0Q1oOyCSe8JN9QD1Ko1-G7oCZwETYEUxioHGk0ob19P3Qa9iTX-T-MzRvmnV3safgPlDW4zRUfQxWZ_3jmJ_pYGh0FskKmOWtT3sBVZhjjcKzzcp20go0ZL1VqPG99MX30UfWu3fg0Q08Uq1NQam6yRd27dYsXGwEblvHwZuK83NQSizgGJnOn1tjNVuHeYn8sN7mbsgCLl-vXZ33heDM4e9l67x55tMdMnSbUkC3huMFVuHiKVBTElJvwdSYkchbb3k6wz29x7tiSzh0rGSP_ZDe72niIiVcr2an3aHzz-zffciOY-7sFSBDqlZqr7L1D0v3xQpcbBRAZc7VrLPwZF5fLd8ovOS5fUMfZaNyt9mL4Olp9j06VKlLg_Gu4uX7-2Pak3Pq7Ac0dpBFSKSlxANH9cgJUXEkc27R_JCo83p3WAnhPb_tnWNvI3WERaj4s_r7TusfDlS2Uanzn8H0yeNQ4bJ9-eMVIU-_cGSQjtY1bt79NFZyE1NNy-Ogt8RBfm8d5R-n8px7SjhirXuFzb_O_EzQBQNdoHOd6YDy8v7ETtame837ORhxtExLgJHFFWDkxSllTgZBYu7ikpbTZXFMPdgzn_qeQmIGdbZihOasxtlY3iIoRZR0vsCw-srF_XPtgnXp5RMma5xgcKqN8QB10cQXb1slRGTL-LiJ1GxpUAPQGaXlompzHkaySLLuoNrqev0ENG-GTYH9s-Do9PFGya9b0t8RH0yWYHywlOEPaeXjLXBbDVNO6cWslehxTEws7Bm_yp1qfBlHknuz7ZfCzXf9Jj9qsXCm-qfI7sj6Ts-OQcbSDSZqq2NOsLTnD2b93CJJVjNQf9PnkKzRZ2s"
    },
    {
        title: "Преступление и наказание",
        author: "Фёдор Достоевский",
        description: "Роман о моральных дилеммах и преступлении",
        price: 2700,
        category: "Классика",
        imageUrl: "https://yandex-images.clstorage.net/nKV99D337/e7c8f64H/3Pu0GRpFASdr9SRJGzvilH1J4YfnAlcVKKwrONiUx5b2LnC7jB9Q87QAbxCNWkkdrMYe4qXj_XFNur4qK1uLw6i_sBk79GQi60VkCE7_82SsDvPl5fA0tl9uWRsOhSfXUr7wP_yaBlVlNdhmepwKjT307fLA9UiWia1ZH-xN7aW9y7SNj6LCZLvWtnrpnfCkXo-xVwRwJlY-Pbo4vUTUZJIMMwq8OSb00rW5tDpeOT0u5E3gABfKFsteuZw_Pm7EPBkmH-wRk-Q6xjX5Kj_QlQ8ugtTn0rd2LI6beT4ENZUyT9M7jvinVFMWCJS5Dlq8bnUuAiPHuvarf7l-XF-e1d_bhz3s0tO0-TdWOmpegKS8nAEn1rCFJGwc2Ou-1sck4i_BO45o1fZTpjiXCqz4_V5F_QOh9JtWKI84XS9P3HRcmuecPbChhDrHNxrKrpPmnx_yNbfBRHR-LPkbPKfX1YGtgIhuCNS3ola49djuOAxM5I9CQNVKVmiOGR587u5U7en3XP2QcbTrFDQqe1wAJy8uEKXFgqUkTr64-f9m1abwX5MJzyqlZYEWuQR6ThseffeuwXNnWrdYfzhN7h28l69Y1D5vIyJkmydGKEr98ybcXaA2tMLnBc9OqXuu16c1EozDyo9ahtQhxihmWQ-67U2U3LCQFhrUGf373g6ufmauqeY-jICjt6jmFwq4reAEzS_gxIbBNcZPzorpLTbWhIKecvoNC8Y2U3erJis9Ke3OF28jQ6RaNlgfWD-sLL3UD2qnb9_QsFcJtCda2vxCpT1fcUVFIbdl7j1IaDy15sYh_vI7zjnkBDK1CgW4zvncbDR_4BHmiNXrv3ut3Iy9Fa77p54cksP2-bamKHjfk-T-nqMUh9J3ZEzOuGjMxfTFEe7BSkxJNAYSBVl2ar6InuxXv1CRhJl0q264P79cjjWs-8ee7REzBWllRhtrfbAnbQ_BZ6RAB2ZuPjn5PDQ1k"
    },
    {
        title: "Маленький принц",
        author: "Антуан де Сент-Экзюпери",
        description: "Философская сказка для детей и взрослых",
        price: 2000,
        category: "Философия",
        imageUrl: "https://cdn1.ozone.ru/s3/multimedia-7/6051782047.jpg"
    },
    {
        title: "Алхимик",
        author: "Пауло Коэльо",
        description: "Роман о поиске своего пути и предназначения",
        price: 2200,
        category: "Философия",
        imageUrl: "https://cdn1.ozone.ru/s3/multimedia-0/6008888148.jpg"
    },
    {
        title: "Три товарища",
        author: "Эрих Мария Ремарк",
        description: "Роман о дружбе, любви и потерях",
        price: 2600,
        category: "Классика",
        imageUrl: "https://avatars.mds.yandex.net/get-mpic/4465918/img_id6582695970493855.jpeg/orig"
    },
    {
        title: "Сто лет одиночества",
        author: "Габриэль Гарсиа Маркес",
        description: "Магический реализм о семье Буэндиа",
        price: 2900,
        category: "Магический реализм",
        imageUrl: "https://cdn1.ozone.ru/s3/multimedia-6/6666082566.jpg"
    },
    {
        title: "451 градус по Фаренгейту",
        author: "Рэй Брэдбери",
        description: "Антиутопия о мире, где книги запрещены",
        price: 2400,
        category: "Антиутопия",
        imageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/db/Fahrenheit_451_1st_ed_cover.jpg/800px-Fahrenheit_451_1st_ed_cover.jpg"
    },
    {
        title: "Метро 2033",
        author: "Дмитрий Глуховский",
        description: "Постапокалиптический роман о жизни в московском метро",
        price: 2300,
        category: "Фантастика",
        imageUrl: "https://cdn1.ozone.ru/s3/multimedia-v/6298587163.jpg"
    },
    {
        title: "Игра престолов",
        author: "Джордж Р. Р. Мартин",
        description: "Эпический фэнтези-роман о борьбе за власть",
        price: 3200,
        category: "Фэнтези",
        imageUrl: "https://cdn.book24.ru/v2/ASE000000000724226/COVER/cover13d__w820.jpg"
    },
    {
        title: "Шантарам",
        author: "Грегори Дэвид Робертс",
        description: "Роман о жизни в Индии и поиске себя",
        price: 2800,
        category: "Приключения",
        imageUrl: "https://yandex-images.clstorage.net/nKV99D337/e7c8f64H/3Pu0GRpFASdr9SRJGzvilH1J4YfnAlcVKKwrONiUx5b2LnC7jB9QswQQX6B9ukkdrMYe4qWz_RE9yt4KSxtbA8iPgLn7pPSy60VkCE7_82SsDvPl5fA0tl9uWRsOhSfXUr7wP_yaBlVlNdhmepwKjT307fLA9UiWia1ZH-xN7aW9y7SNj6LCZLvWtnrpnfCkXo-xVwRwJlY-Pbo4vUTUZJIMMwq8OSb00rW5tDpeOT0u5E3gABfKFsteuZw_Pm7EPBkmH-wRk-Q6xjX5Kj_QlQ8ugtTn0rd2LI6beT4ENZUyT9M7jvinVFMWCJS5Dlq8bnUuAiPHuvarf7l-XF-e1d_bhz3s0tO0-TdWOmpegKS8nAEn1rCFJGwc2Ou-1sck4i_BO45o1fZTpjiXCqz4_V5F_QOh9JtWKI84XS9P3HRcmuecPbChhDrHNxrKrpPmnx_yNbfBRHR-LPkbPKfX1YGtgIhuCNS3ola49djuOAxM5I9CQNVKVmiOGR587u5U7en3XP2QcbTrFDQqe1wAJy8uEKXFgqUkTr64-f9m1abwX5MJzyqlZYEWuQR6ThseffeuwXNnWrdYfzhN7h28l69Y1D5vIyJkmydGKEr98ybcXaA2tMLnBc9OqXuu16c1EozDyo9ahtQhxihmWQ-67U2U3LCQFhrUGf373g6ufmauqeY-jICjt6jmFwq4reAEzS_gxIbBNcZPzorpLTbWhIKecvoNC8Y2U3erJis9Ke3OF28jQ6RaNlgfWD-sLL3UD2qnb9_QsFcJtCda2vxCpT1fcUVFIbdl7j1IaDy15sYh_vI7zjnkBDK1CgW4zvncbDR_4BHmiNXrv3ut3Iy9Fa77p54cksP2-bamKHjfk-T-nqMUh9J3ZEzOuGjMxfTFEe7BSkxJNAYSBVl2ar6InuxXv1CRhJl0q264P79cjjWs-8ee7REzBWllRhtrfbAnbQ_BZ6RAB2ZuPjn5PDQ1k"
    },
    {
        title: "Код да Винчи",
        author: "Дэн Браун",
        description: "Детективный роман о тайнах истории",
        price: 2600,
        category: "Детектив",
        imageUrl: "https://avatars.mds.yandex.net/i?id=5bc31d542f50041e3a6cc171afc41765_l-4078141-images-thumbs&n=13"
    },
    {
        title: "Мартин Иден",
        author: "Джек Лондон",
        description: "Роман о становлении писателя",
        price: 2400,
        category: "Классика",
        imageUrl: "https://static.onlinetrade.ru/img/items/b/kniga_martin_iden_london_dzhek__1568052_1.jpg"
    },
    {
        title: "Дюна",
        author: "Фрэнк Герберт",
        description: "Эпический научно-фантастический роман",
        price: 3000,
        category: "Фантастика",
        imageUrl: "https://cdn1.ozone.ru/s3/multimedia-1-b/7046938235.jpg"
    },
    {
        title: "Властелин колец",
        author: "Дж. Р. Р. Толкин",
        description: "Эпическая фэнтези-сага о Средиземье",
        price: 3500,
        category: "Фэнтези",
        imageUrl: "https://static2.my-shop.ru/products213/2128174/cover.jpg"
    }
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000 // Увеличено до 10 секунд
        });
        console.log('Connected to MongoDB');
        
        console.log('Deleting existing books...');
        await Book.deleteMany({});
        console.log('Existing books deleted');
        
        console.log('Inserting new books...');
        await Book.insertMany(books);
        console.log('Books inserted successfully');
        
        // Закрываем подключение к MongoDB
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        console.error('Full error details:', JSON.stringify(err, null, 2));
        process.exit(1);
    }
}

seed(); 