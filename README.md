# 🌱 Cultiva Web

A modern full-stack web application designed to revolutionize agricultural monitoring and predictive analytics using AI/ML technologies.

---

## 📖 Asal Usul (Project Origin)

**Cultiva Web** dimulai dari sebuah visi sederhana namun powerful: memberdayakan petani dengan teknologi cutting-edge untuk meningkatkan hasil pertanian mereka. 

Dalam era digital ini, mayoritas petani masih menggunakan metode tradisional dalam memantau kesehatan tanaman, prediksi cuaca, dan pengambilan keputusan bisnis. Kesenjangan digital ini menciptakan peluang bagi inovasi yang dapat menghubungkan gap antara teknologi modern dan praktik pertanian konvensional.

**Cultiva Web** adalah solusi terintegrasi yang menggabungkan:
- 🚀 **Real-time Monitoring**: Dashboard interaktif untuk tracking kondisi lahan
- 🤖 **Predictive Analytics**: Machine Learning models untuk prediksi hasil panen
- 📊 **Smart Insights**: Rekomendasi actionable berbasis data
- 👥 **Community Focus**: Platform untuk kolaborasi antar petani

---

## 🎯 Problem Statement

### Masalah yang Kami Selesaikan:

1. **Information Gap**
   - Petani kesulitan mendapatkan informasi real-time tentang kondisi lahan mereka
   - Prediksi cuaca dan rekomendasi bisnis sulit diakses

2. **Decision Making Complexity**
   - Pengambilan keputusan masih bergantung pada intuisi dan pengalaman saja
   - Tidak ada data-driven insights untuk optimasi hasil panen

3. **Digital Divide**
   - Mayoritas petani tidak terbiasa dengan teknologi modern
   - Kompleksitas tools yang ada membuat adoption rate rendah

4. **Efficiency Loss**
   - Monitoring manual menghabiskan waktu dan tidak akurat
   - Potensi kerugian besar jika ada penyakit tanaman yang tidak terdeteksi lebih awal

### Solusi Kami:

Cultiva Web menyediakan platform yang **user-friendly, affordable, dan accessible** untuk membantu petani membuat keputusan yang lebih baik dengan memanfaatkan data dan AI.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React framework dengan server-side rendering
- **UI Components**: Built-in React 19 dengan [Lucide React](https://lucide.dev/) untuk icons
- **Animation**: [Framer Motion](https://www.framer.com/motion/) untuk smooth animations
- **Styling**: CSS Modules
- **Language**: TypeScript

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast Python web framework
- **Server**: [Uvicorn](https://www.uvicorn.org/) - ASGI web server
- **Language**: Python 3.12+
- **Environment**: python-dotenv untuk environment variables

### Architecture
```
Frontend (Next.js)  <--API--> Backend (FastAPI)
    |                              |
    v                              v
  Browser                    Database (TBD)
                                 +
                            ML Models (TBD)
```

---

## 📁 Project Structure

```
cultiva-web/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Pages dan layouts
│   │   │   ├── api/         # API examples
│   │   │   └── page.tsx     # Main page
│   │   └── components/      # Reusable components
│   │       ├── BottomNav.tsx
│   │       └── tabs/        # Feature tabs
│   ├── public/              # Static assets
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # FastAPI Python application
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── core/            # Core utilities
│   │   ├── models/          # Database models
│   │   └── schemas/         # Pydantic schemas
│   ├── main.py              # Entry point
│   ├── requirements.txt      # Python dependencies
│   └── tests/               # Unit tests
│
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Frontend)
- Python 3.12+ (Backend)
- Git

### Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

### Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend akan berjalan di `http://localhost:8000`

---

## 📚 Features

### MVP (Minimal Viable Product)
- ✅ Dashboard Interface
- ✅ Real-time Data Display
- ✅ API Integration
- ✅ Responsive Design

### Roadmap
- 🔄 User Authentication & Authorization
- 🔄 Database Integration
- 🔄 AI/ML Models untuk Predictive Analytics
- 🔄 Mobile App Version
- 🔄 IoT Sensor Integration
- 🔄 Community Features

---

## 📝 Development Workflow

### Commit Convention

Kami mengikuti [Conventional Commits](https://www.conventionalcommits.org/) untuk konsistensi:

```
feat:    Add new feature
fix:     Fix bug
docs:    Documentation
style:   Code style changes (formatting, missing semicolons, etc)
refactor: Code refactoring
perf:    Performance improvements
test:    Add/modify tests
chore:   Build process, dependencies, etc
```

**Example:**
```bash
git commit -m "feat: add real-time monitoring dashboard"
git commit -m "fix: resolve CORS issues with backend"
git commit -m "docs: update README with setup instructions"
```

---

## 🤝 Contributing

Kami sangat welcome terhadap kontribusi! Berikut langkah-langkahnya:

1. Fork repository ini
2. Buat branch baru: `git checkout -b feat/your-feature-name`
3. Commit changes: `git commit -m "feat: your feature description"`
4. Push ke branch: `git push origin feat/your-feature-name`
5. Buat Pull Request

---

## 📞 Contact & Support

- 👤 **Project Lead**: [Anindya Wita](https://github.com/anindyawita)
- 📧 **Email**: TBA
- 💬 **Discord**: TBA

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - feel free to use it for personal and commercial projects.

---

## 🙏 Acknowledgments

- Next.js community dan dokumentasi
- FastAPI community
- All contributors dan supporters

---

**Made with ❤️ for farmers, by developers.**

*Last updated: May 2026*
