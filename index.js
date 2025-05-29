require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'https://fe-foody.onrender.com' , 'https://www.giakietngo.id.vn', 'https://hoxuanhung2802.id.vn'] }));

aapp.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  const host = req.headers.host || '';

  // Kiểm tra domain chính xác bạn muốn chặn
  if (host === 'hoxuanhung2802.id.vn' && /Chrome/i.test(ua)) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Access Denied</title>
        <style>
          body {
            background-color: #f0f0f0;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            text-align: center;
            padding: 50px;
          }
          h1 {
            font-size: 48px;
            color: #f05030;
            margin-bottom: 0;
          }
          p {
            font-size: 18px;
            margin-top: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
          }
          .footer {
            margin-top: 40px;
            font-size: 14px;
            color: #666;
          }
          a {
            color: #0070c9;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sorry, you have been blocked</h1>
          <p>You are unable to access <strong>${host}</strong></p>
          <p><strong>Why have I been blocked?</strong></p>
          <p>This website is using a security service to protect itself from online attacks. The action you just performed triggered the security solution. There are several actions that could trigger this block including submitting a certain word or phrase, a SQL command or malformed data.</p>
          <p><strong>What can I do to resolve this?</strong></p>
          <p>You can email the site owner to let them know you were blocked. Please include what you were doing when this page came up.</p>
          <div class="footer">
            <p>Performance &amp; security by Cloudflare</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  next();
});




app.use(express.json());

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


// API: Lấy danh sách món ăn
app.get('/meals', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('meals')
            .select('id, name, description, price, image_url, category_id, category(name)');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Lấy chi tiết món ăn
app.get('/meals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('meals')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Lấy danh mục món ăn
app.get('/categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('category')
            .select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// API: Thêm món ăn mới

app.post('/meals', async (req, res) => {
    try {
        const { name, description, price, image_url, category_id } = req.body;

        const { data, error } = await supabase
            .from('meals')
            .insert([{ name, description, price, image_url, category_id }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/meals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image_url, category_id } = req.body;

        const { data, error } = await supabase
            .from('meals')
            .update({ name, description, price, image_url, category_id })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/meals/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('meals')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Xoá món ăn thành công' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/meals', async (req, res) => {
    try {
        const { search, category_id } = req.query;

        let query = supabase
            .from('meals')
            .select('id, name, description, price, image_url, category_id, category(name)');

        // Nếu có từ khoá tìm kiếm
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Nếu có lọc theo danh mục
        if (category_id) {
            query = query.eq('category_id', category_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
