require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Обновляем всех существующих пользователей, установив им роль 'user'
        await User.updateMany({}, { role: 'user' });
        console.log('Updated existing users');

        // Проверяем существует ли админ
        let admin = await User.findOne({ username: 'admin' });

        if (!admin) {
            // Создаем админа
            admin = new User({
                username: 'admin',
                email: 'admin@example.com',
                password: '123',
                role: 'admin'
            });
            await admin.save();
            console.log('Admin created successfully');
        } else {
            // Обновляем существующего админа
            admin.role = 'admin';
            await admin.save();
            console.log('Admin role updated');
        }

        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error:', error);
    }
}

createAdmin(); 