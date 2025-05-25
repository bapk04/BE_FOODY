require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'https://fe-foody.onrender.com' , 'https://www.giakietngo.id.vn'] }));
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'];
    if (userAgent && userAgent.includes('Chrome')) {
        return res.status(403).send('Không hỗ trợ truy cập từ trình duyệt Chrome');
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
