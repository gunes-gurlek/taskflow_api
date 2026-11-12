# TASKFLOW – Proje Tanıtım Dokümanı

**Node.js ile Backend Programlama – Bitirme Projesi**

## 1. Amaç

TASKFLOW, bir yazılım şirketinin ekip içindeki görevleri, projeleri ve çalışanların sorumluluklarını takip edebilmesi için geliştirilmiş bir **Görev ve Proje Yönetim Sistemi REST API'sidir**. Proje, eğitim boyunca edinilen Node.js, Express.js, REST tasarımı, routing, middleware ve CRUD becerilerini gerçek hayatta kullanılabilecek bir uygulamada göstermeyi amaçlar.

## 2. Senaryo

Bir yazılım ekibinde yöneticiler görevleri tek bir panelden yönetmek ister. Sistem şunları sağlar:

- Yeni görev oluşturma ve çalışanlara atama,
- Görev durumunun takibi (`pending` → `in-progress` → `completed`),
- Öncelik yönetimi (`low`, `medium`, `high`),
- Duruma, önceliğe, çalışana ve anahtar kelimeye göre filtreleme/arama; sıralama ve sayfalama,
- Tamamlanan/bekleyen görev sayıları ve genel sistem özeti gibi temel raporlar.

Sistemi bir ön yüz uygulaması, mobil uygulama veya Postman gibi herhangi bir HTTP istemcisi kullanabilir.

## 3. Sistem Özeti

| Konu | Karar |
|---|---|
| Teknoloji | Node.js (≥18), Express.js (tek bağımlılık) |
| Mimari | Katmanlı: **Route → (Middleware) → Controller → Service → Veri deposu** |
| Veri saklama | JSON dosyası (`src/data/tasks.json`); bellekte çalışır, her değişiklikte dosyaya atomik yazılır |
| Biçim | JSON; tüm yanıtlar `{ success, data, meta? }` veya `{ success:false, error }` zarfındadır |
| Middleware | **Logger** (zorunlu), **Validation** (id, gövde, sorgu), 404 ve merkezi hata yakalayıcı |
| Test | Postman koleksiyonu (otomatik test script'leri) + Node yerleşik test runner |

### Veri Modeli – `Task`

| Alan | Tip | Kural |
|---|---|---|
| id | number | otomatik |
| title | string | zorunlu, 3–100 karakter |
| description | string | en fazla 500 karakter |
| status | enum | pending / in-progress / completed |
| priority | enum | low / medium / high |
| assignee | string \| null | 2–50 karakter |
| createdAt, updatedAt | ISO tarih | otomatik |

### Klasör Yapısı

`src/routes` (endpoint tanımları) · `src/controllers` (HTTP katmanı) · `src/services` (iş mantığı, raporlar) · `src/middlewares` (logger, validate, errorHandler) · `src/data` (veri deposu) · `test` · `postman_collection.json`

## 4. API Tasarımı (Endpoint Listesi)

| Metot | Endpoint | Amaç |
|---|---|---|
| POST | `/tasks` | Görev ekle (201) |
| GET | `/tasks` | Listele; `status`, `priority`, `sort`, `order`, `page`, `limit` |
| GET | `/tasks/:id` | Görev detayı |
| PUT / PATCH | `/tasks/:id` | Tam / kısmi güncelleme |
| DELETE | `/tasks/:id` | Görev sil |
| GET | `/tasks/search?keyword=` | Anahtar kelime ile arama |
| GET | `/tasks/assignee/:name` | Çalışana göre listeleme |
| GET | `/reports/completed` | Tamamlanan görev sayısı |
| GET | `/reports/pending` | Bekleyen görev sayısı |
| GET | `/reports/summary` | Genel sistem özeti |

Hata durumları: geçersiz veri/parametre → **400**, kayıt veya endpoint yok → **404**, beklenmeyen hata → **500**. Hata yanıtları hangi alanın neden hatalı olduğunu açıklar.

## 5. Gereksinim Karşılama

| Yönerge maddesi | Karşılığı |
|---|---|
| Node.js projesi, Express kurulumu, klasör yapısı, routing | `package.json`, `src/app.js`, `src/routes/*` |
| Görev ekleme / listeleme / detay / güncelleme / silme | `src/controllers/task.controller.js`, `src/services/task.service.js` |
| Logger: method, endpoint, zaman damgası | `src/middlewares/logger.js` → konsol + `logs/access.log` |
| Postman testleri | `postman_collection.json` (CRUD, filtre, validation, rapor) |
| Pratik 1: filtreleme, arama, sıralama, sayfalama | `GET /tasks`, `/tasks/search`, `/tasks/assignee/:name` |
| Pratik 2: validation middleware | `src/middlewares/validate.js` (title, description, priority, assignee + status, id, sorgu) |
| Pratik 3: raporlama | `src/services/report.service.js`, `/reports/*` |
| Pratik 4: dokümantasyon | `README.md` (kurulum + API), bu doküman |

## 6. Çalıştırma

```bash
npm install
npm start      # http://localhost:3000
npm test       # otomatik testler
```

Ayrıntılar için `README.md`; Postman testleri için `postman_collection.json` dosyasını Postman'e import edin.

## 7. Olası Geliştirmeler

Veritabanı (MongoDB/PostgreSQL), kimlik doğrulama ve rol yönetimi, proje/ekip varlıkları, görevlere yorum ve bitiş tarihi eklenmesi.
