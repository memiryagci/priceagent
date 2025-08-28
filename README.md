# PriceAgent

**Fiyat Takip ve Alarm Sistemi**

PriceAgent, kullanıcıların ürün ekleyip hedef fiyat belirleyebildiği, sistemin belirli aralıklarla ürün fiyatlarını kontrol ederek hedef altına düştüğünde e-posta ile uyarı gönderdiği bir uygulamadır.  

---

## 🚀 Özellikler

| Özellik | Açıklama |
|---------|----------|
| Ürün Ekleme | Kullanıcı ürün ekleyip hedef fiyat belirleyebilir |
| Fiyat Kontrolü | Cron job ile ürün fiyatları düzenli olarak kontrol edilir |
| E-posta Alarmı | Hedef fiyatın altına düşen ürünler için mail gönderilir |
| En Düşük Fiyat Takibi | Ürünlerin sitelerden çekilen fiyatlarının en düşük değeri günlük olarak kaydedilir |
| Güvenlik | JWT ile kullanıcı doğrulama, sadece kendi ürünlerini görebilir ve yönetebilir |
| Güncelleme & Silme | Ürün bilgileri güncellenebilir veya silinebilir |

---

## 🛠 Teknolojiler

- **Backend:** Node.js, Express  
- **Veri Tabanı:** MSSQL, Sequelize ORM  
- **Zamanlayıcı:** Node-cron  
- **Mail Gönderimi:** Nodemailer (Gmail SMTP)  
- **Kullanıcı Doğrulama:** JWT  

---

## 📈 Fiyat Takibi

- Ürün eklendiğinde mevcut fiyat çekilir ve response’ta gösterilir.  
- Fiyat değişimleri, ürün eklenmesinden itibaren en düşük fiyat üzerinden günlük olarak kaydedilir.  
- Her ürün için fiyat grafikleri ve değişim geçmişi frontend ile görselleştirilebilir.  

---

## 🔒 Kullanım Notları

- Kullanıcı sadece kendi eklediği ürünleri görüntüleyebilir ve yönetebilir.  
- Cron job her 10 dakikada bir fiyatları kontrol eder.  
- E-posta gönderebilmek için Gmail SMTP ayarları gerekir.  

---

