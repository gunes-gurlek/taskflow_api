# TASKFLOW – Görev ve Proje Yönetim Sistemi API

Node.js + Express ile geliştirilmiş, tamamen REST mantığında çalışan bir görev yönetim API'sidir.
Görev oluşturma, çalışanlara atama, durum/öncelik takibi, filtreleme-arama-sayfalama, validation ve raporlama özelliklerini içerir.

| Kapsam | Durum |
|---|---|
| **Zorunlu:** Görev CRUD (ekle, listele, detay, güncelle, sil) | ✅ |
| **Zorunlu:** Routing altyapısı ve klasör yapısı | ✅ |
| **Zorunlu:** Logger middleware (method, endpoint, zaman damgası) | ✅ |
| **Zorunlu:** Postman ile test | ✅ `postman_collection.json` |
| İsteğe bağlı 1: Filtreleme, arama, sıralama, sayfalama | ✅ |
| İsteğe bağlı 2: Validation middleware (400 Bad Request) | ✅ |
| İsteğe bağlı 3: Raporlama servisleri | ✅ |
| İsteğe bağlı 4: Dokümantasyon | ✅ README + `PROJECT_OVERVIEW.md` |

## Gereksinimler

- [Node.js](https://nodejs.org) **18 veya üzeri** (geliştirme: v22)
- npm
- [Postman](https://www.postman.com/downloads/) (test için)

## Kurulum ve Çalıştırma

```bash
# 1. Projeyi indirin
git clone <repo-adresi>
cd taskflow_api

# 2. Bağımlılıkları kurun
npm install

# 3. Sunucuyu başlatın
npm start
```

Sunucu varsayılan olarak **http://localhost:3000** adresinde çalışır. Tarayıcıda açıldığında endpoint listesi görünür.

| Komut | Açıklama |
|---|---|
| `npm start` | Sunucuyu başlatır |
| `npm run dev` | Dosya değişince otomatik yeniden başlatır (`node --watch`) |
| `npm test` | Otomatik testleri çalıştırır (Node yerleşik test runner) |

**Ortam değişkenleri (hepsi isteğe bağlı):** `PORT` (varsayılan 3000), `DATA_FILE` (veri dosyası yolu), `LOG_DIR`, `LOG_TO_FILE=false`, `LOG_TO_CONSOLE=false`.
Windows PowerShell'de port değiştirmek için: `$env:PORT=4000; npm start`

> Veriler `src/data/tasks.json` dosyasında saklanır (6 örnek görev ile gelir). İlk haline dönmek için dosyayı `git checkout src/data/tasks.json` ile geri yükleyin.

## Proje Yapısı

```
taskflow_api/
├── src/
│   ├── server.js              # Sunucuyu başlatır
│   ├── app.js                 # Express uygulaması, middleware ve route bağlantıları
│   ├── config.js              # Port, sabitler (status/priority listeleri, limitler)
│   ├── routes/                # Endpoint tanımları (task.routes, report.routes)
│   ├── controllers/           # HTTP isteği/yanıtı katmanı
│   ├── services/              # İş mantığı (task.service, report.service)
│   ├── middlewares/           # logger, validate, errorHandler
│   ├── data/                  # JSON veri deposu (store.js, tasks.json)
│   └── utils/httpError.js
├── test/api.test.js           # Otomatik testler
├── postman_collection.json    # Postman koleksiyonu
├── docs/screenshots/          # Postman ekran görüntüleri
├── PROJECT_OVERVIEW.md        # Proje tanıtım dokümanı
└── package.json
```

## Veri Modeli (Task)

| Alan | Tip | Açıklama |
|---|---|---|
| `id` | number | Otomatik artan benzersiz kimlik |
| `title` | string | **Zorunlu**, 3–100 karakter |
| `description` | string | İsteğe bağlı, en fazla 500 karakter (varsayılan `""`) |
| `status` | string | `pending` \| `in-progress` \| `completed` (varsayılan `pending`) |
| `priority` | string | `low` \| `medium` \| `high` (varsayılan `medium`) |
| `assignee` | string \| null | Atanan çalışan, 2–50 karakter (varsayılan `null`) |
| `createdAt` / `updatedAt` | ISO 8601 | Otomatik |

## API Endpoint'leri

### Görev CRUD (zorunlu)

| Metot | Endpoint | Açıklama | Başarı kodu |
|---|---|---|---|
| POST | `/tasks` | Yeni görev ekler | 201 |
| GET | `/tasks` | Görevleri listeler (filtre/sıralama/sayfalama destekli) | 200 |
| GET | `/tasks/:id` | Görev detayı | 200 |
| PUT | `/tasks/:id` | Görevi günceller (`title` zorunlu; verilmeyen alanlar varsayılana döner) | 200 |
| PATCH | `/tasks/:id` | Görevi kısmi günceller (en az bir alan) | 200 |
| DELETE | `/tasks/:id` | Görevi siler | 200 |

### Filtreleme, arama, sıralama, sayfalama (isteğe bağlı)

| Endpoint | Açıklama |
|---|---|
| `GET /tasks?status=completed` | Duruma göre filtre |
| `GET /tasks?priority=high` | Önceliğe göre filtre |
| `GET /tasks/assignee/musa` | Kullanıcıya göre liste (büyük/küçük harf duyarsız) |
| `GET /tasks/search?keyword=backend` | `title`, `description`, `assignee` içinde arama (`keyword` zorunlu) |
| `GET /tasks?sort=createdAt&order=desc` | Sıralama (`id, title, status, priority, assignee, createdAt, updatedAt`); `sort=-createdAt` da kullanılabilir |
| `GET /tasks?page=1&limit=10` | Sayfalama (varsayılan 1 / 10, en fazla 100) |

Parametreler birleştirilebilir: `GET /tasks?status=pending&priority=high&sort=-createdAt&page=1&limit=5`

### Raporlama (isteğe bağlı)

| Endpoint | Yanıt |
|---|---|
| `GET /reports/completed` | `{ completedCount }` |
| `GET /reports/pending` | `{ pendingCount, inProgressCount }` |
| `GET /reports/summary` | Toplam, duruma/önceliğe/çalışana göre dağılım, atanmamış sayısı, tamamlanma oranı (%) |

### Diğer

`GET /` (API bilgisi), `GET /health` (sağlık kontrolü)

## Örnek İstek / Yanıt

```http
POST /tasks
Content-Type: application/json

{ "title": "Rapor hazırla", "priority": "high", "assignee": "musa" }
```

```json
{
  "success": true,
  "data": {
    "id": 7, "title": "Rapor hazırla", "description": "", "status": "pending",
    "priority": "high", "assignee": "musa",
    "createdAt": "2026-11-12T10:00:00.000Z", "updatedAt": "2026-11-12T10:00:00.000Z"
  }
}
```

Liste yanıtları ek olarak `meta: { total, page, limit, totalPages }` içerir.

**Hata yanıtı** (örn. `POST /tasks` ile `{ "priority": "urgent" }`) – **400 Bad Request**:

```json
{
  "success": false,
  "error": {
    "status": 400,
    "message": "Doğrulama hatası: gönderilen veriler geçersiz.",
    "details": [
      { "field": "title", "message": "title alanı zorunludur." },
      { "field": "priority", "message": "priority şunlardan biri olmalıdır: low, medium, high." }
    ]
  }
}
```

| Kod | Anlamı |
|---|---|
| 400 | Geçersiz/eksik veri, geçersiz id veya sorgu parametresi, bozuk JSON |
| 404 | Görev veya endpoint bulunamadı |
| 500 | Beklenmeyen sunucu hatası |

## Logger

Her istek, tamamlandığında konsola ve `logs/access.log` dosyasına şu biçimde yazılır:

```
[2026-11-12T10:29:36.484Z] GET /tasks?limit=2 200 7.5ms
```

## Postman ile Test

1. Postman → **Import** → `postman_collection.json` dosyasını seçin.
2. Sunucunun çalıştığından emin olun (`npm start`). `baseUrl` değişkeni `http://localhost:3000`'dir.
3. **CRUD (Zorunlu)** klasörünü sırayla çalıştırın (isteklere tek tek tıklayın ya da klasöre sağ tık → *Run folder*). Oluşturulan görevin `id` değeri `taskId` değişkenine otomatik yazılır.
4. Her istekte durum kodu ve yanıt gövdesi için otomatik testler (**Test Results** sekmesi) bulunur.
5. Teslim için ekran görüntülerini `docs/screenshots/` klasörüne kaydedin (ekleme, listeleme, detay, güncelleme, silme).

Koleksiyon klasörleri: CRUD · Filtreleme/Arama/Sayfalama · Validation ve Hata Durumları · Raporlama · Genel.
