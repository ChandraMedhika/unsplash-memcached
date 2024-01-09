import express from 'express';
import axios from 'axios';
const app = express();
import Memcached from 'memcached';

const memcached = new Memcached('localhost:11211'); // Sesuaikan dengan lokasi dan port Memcached server Anda

app.get('/api/data', async (req, res) => {
  const cacheKey = 'dataCache'; // Sesuaikan dengan kunci cache yang sesuai dengan kebutuhan Anda

  // Coba ambil data dari cache Memcached
  memcached.get(cacheKey, async (err, data) => {
    if (err || !data) {
      // Jika tidak ada data di cache, ambil dari API Unsplash
      try {
        const unsplashResponse = await axios.get('https://api.unsplash.com/photos/', {
          params: {
            client_id: 'SxkLchT514J7Bg8Opk7bXzz-BmJUrOeyTqEVgLRAYgU', // Gantilah dengan kunci API Unsplash Anda
          },
        });

        const newData = unsplashResponse.data;

        // Simpan data ke cache
        memcached.set(cacheKey, newData, 60, (cacheErr) => {
          if (!cacheErr) {
            console.log('Data disimpan di cache');
          }
        });

        // Kirim data ke klien
        res.json({ results: newData });
      } catch (apiError) {
        console.error('Gagal mengambil data dari API Unsplash:', apiError.message);
        res.status(500).send('Gagal mengambil data dari API Unsplash');
      }
    } else {
      // Jika data ada di cache, kirim langsung ke klien
      console.log('Data diambil dari cache');
      res.json({ results: data });
    }
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server Express berjalan di http://localhost:${port}`);
});