require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const Book = require('./models/Book');
const User = require('./models/User');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

const pageAuthMiddleware = (req, res, next) => {
   
    let token = null;
    
    const authHeader = req.header('Authorization');
    if (authHeader) {
        token = authHeader.replace('Bearer ', '');
    }

    if (!token && req.query.token) {
        token = req.query.token;
    }
    
    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.redirect('/login');
    }
};


const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'catalog.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});


app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});


app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});


app.get('/checkout', pageAuthMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});


app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});


app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json({
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.put('/api/profile', authMiddleware, async (req, res) => {
    try {
        const { email, password } = req.body;
        const update = {};
        if (email) update.email = email;
        if (password) update.password = await bcrypt.hash(password, 10);
        const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.delete('/api/profile', authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.userId);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Пользователь с таким именем или email уже существует' 
            });
        }

        
        const user = new User({
            username,
            email,
            password,
            role: 'user' 
        });

        await user.save();
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.post('/api/login', async (req, res) => {
    console.log('Login request received:', req.body); 
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found:', username); 
            return res.status(400).json({ message: 'Пользователь не найден' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Invalid password for user:', username); 
            return res.status(400).json({ message: 'Неверный пароль' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful for user:', username); 
        res.cookie('token', token, { httpOnly: true });
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err); 
        res.status(400).json({ message: err.message });
    }
});


app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Книга не найдена' });
        }
        res.json(book);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.post('/api/profile/read-books', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const { bookId } = req.body;
        
        if (!user.readBooks.includes(bookId)) {
            user.readBooks.push(bookId);
            await user.save();
        }
        
        res.json({ message: 'Книга добавлена в прочитанные' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.post('/api/profile/cart', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const { bookId } = req.body;
        
        const existingItem = user.cart.find(item => item.book.toString() === bookId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cart.push({ book: bookId });
        }
        
        await user.save();
        res.json({ message: 'Книга добавлена в корзину' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.get('/api/profile/cart', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('cart.book');
        res.json(user.cart);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.get('/api/profile/read-books', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('readBooks');
        res.json(user.readBooks);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.delete('/api/profile/cart/:bookId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.cart = user.cart.filter(item => item.book.toString() !== req.params.bookId);
        await user.save();
        res.json({ message: 'Книга удалена из корзины' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.delete('/api/profile/read-books/:bookId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.readBooks = user.readBooks.filter(id => id.toString() !== req.params.bookId);
        await user.save();
        res.json({ message: 'Book removed from read books' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const { fullname, email, phone, city, address, postal, paymentMethod } = req.body;
        
        
        const cartItems = user.cart;
        
   
        const order = {
            userId: req.userId,
            items: cartItems,
            shippingDetails: {
                fullname,
                email,
                phone,
                city,
                address,
                postal
            },
            paymentMethod,
            totalAmount: cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0),
            status: 'pending',
            createdAt: new Date()
        };

        
        user.cart = [];
        await user.save();

        res.json({ message: 'Order created successfully', order });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '-password');
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot modify admin user' });
        }
        user.email = req.body.email;
        await user.save();
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin user' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/admin/books/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(book);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/admin/books/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
