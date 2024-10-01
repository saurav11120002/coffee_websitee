// Import required modules
import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' folder

// Define routes for serving HTML pages
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.get("/log", (req, res) => {
  res.sendFile("login.html", { root: "public" });
});

app.get("/shopp", (req, res) => {
  res.sendFile("cart.html", { root: "public" });
});

// MySQL Database Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Saurav_2003',
    database: 'coffeeshop'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// ----------- User Authentication Routes -----------

// Route to handle user login
// Route to handle user login
app.post('/login', (req, res) => {
  const { phone, password } = req.body;

  // Check if both phone and password are provided
  if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
  }

  const query = 'SELECT id FROM users WHERE phone = ? AND password = ?';

  connection.query(query, [phone, password], (err, results) => {
      if (err) {
          // Return a detailed error message for debugging
          return res.status(500).json({ error: 'Database query error', details: err.message });
      }

      if (results.length === 0) {
          // Return a clearer message when credentials are wrong
          return res.status(401).json({ error: 'Invalid phone number or password' });
      }

      // Successful login: return userId
      const userId = results[0].id;
      res.json({ userId });
  });
});



// Route to handle user signup
app.post('/signup', (req, res) => {
    const { phone, password } = req.body;
    const query = 'INSERT INTO users (phone, password) VALUES (?, ?)';

    connection.query(query, [phone, password], (err, result) => {
        if (err) {
            return res.status(500).send('Error registering user');
        }
        res.status(201).send('User registered successfully');
    });
});

// ----------- Cart Functionality ---------------

// Route to get cart items for a specific user
app.get('/cart-items/:userId', (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT * FROM cart WHERE user_id = ?';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching cart items');
            return;
        }
        res.json(results);
    });
});

// Route to add an item to the cart for a specific user
app.post('/cart-items', (req, res) => {
    const { userId, title, price, productImg, quantity } = req.body;
    const query = 'INSERT INTO cart (user_id, title, price, product_img, quantity) VALUES (?, ?, ?, ?, ?)';

    connection.query(query, [userId, title, price, productImg, quantity], (err, result) => {
        if (err) {
            res.status(500).send('Error adding item to the cart');
            return;
        }
        res.status(201).send('Item added to the cart');
    });
});

// Route to update the quantity of an item in the cart for a specific user
app.put('/cart-items/:userId/:id', (req, res) => {
    const { userId, id } = req.params;
    const { quantity } = req.body;
    const query = 'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?';

    connection.query(query, [quantity, id, userId], (err, result) => {
        if (err) {
            res.status(500).send('Error updating cart item');
            return;
        }
        res.send('Cart item updated successfully');
    });
});

// Route to remove an item from the cart for a specific user
app.delete('/cart-items/:userId/:id', (req, res) => {
    const { userId, id } = req.params;
    const query = 'DELETE FROM cart WHERE id = ? AND user_id = ?';

    connection.query(query, [id, userId], (err, result) => {
        if (err) {
            res.status(500).send('Error removing item from the cart');
            return;
        }
        res.send('Cart item removed successfully');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


// Route to get all reviews
app.get('/reviews', (req, res) => {
  connection.query('SELECT * FROM reviews', (err, results) => {
    if (err) {
      res.status(500).send('Error fetching reviews from database');
      return;
    }
    res.json(results);
  });
});

// Route to add a new review
app.post('/reviews', (req, res) => {
  const { name, review, rating } = req.body;
  if (!name || !review || !rating) {
    res.status(400).send('Name, review, and rating are required');
    return;
  }
  const query = 'INSERT INTO reviews (name, review, rating) VALUES (?, ?, ?)';
  connection.query(query, [name, review, rating], (err, result) => {
    if (err) {
      res.status(500).send('Error inserting review into database');
      return;
    }
    res.status(201).send('Review added successfully');
  });
});

// Route to delete a review
app.delete('/reviews/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM reviews WHERE id = ?';
  connection.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).send('Error deleting review from database');
      return;
    }
    res.send('Review deleted successfully');
  });
}); 

