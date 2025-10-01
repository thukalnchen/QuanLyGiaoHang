# Hướng dẫn cài đặt và chạy Web Admin System

## Yêu cầu hệ thống

### Phần mềm cần thiết:
- **Node.js** (phiên bản 14 trở lên) - [Tải tại đây](https://nodejs.org/)
- **PostgreSQL** (phiên bản 12 trở lên) - [Tải tại đây](https://www.postgresql.org/download/)
- **Git** (để clone repository) - [Tải tại đây](https://git-scm.com/)

### Kiểm tra phiên bản:
```bash
node --version
npm --version
psql --version
```

## Cài đặt từng bước

### Bước 1: Chuẩn bị Database

1. **Khởi động PostgreSQL service:**
   ```bash
   # Windows (Command Prompt as Administrator)
   net start postgresql-x64-12
   
   # Hoặc sử dụng pgAdmin để quản lý database
   ```

2. **Tạo database:**
   ```sql
   -- Mở psql hoặc pgAdmin
   CREATE DATABASE web_admin_db;
   CREATE USER admin_user WITH PASSWORD 'admin123';
   GRANT ALL PRIVILEGES ON DATABASE web_admin_db TO admin_user;
   ```

### Bước 2: Cấu hình Environment

1. **Tạo file `.env` trong thư mục gốc:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=web_admin_db
   DB_USER=admin_user
   DB_PASSWORD=admin123

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
   JWT_EXPIRES_IN=24h

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

### Bước 3: Cài đặt Dependencies

```bash
# Cài đặt các package cần thiết
npm install

# Hoặc sử dụng yarn
yarn install
```

### Bước 4: Khởi tạo Database

```bash
# Cách 1: Khởi tạo database và dữ liệu mẫu cùng lúc
npm run setup

# Cách 2: Khởi tạo từng bước
# Bước 4a: Tạo các bảng database
npm run init-db

# Bước 4b: Thêm dữ liệu mẫu
npm run seed
```

**Kết quả mong đợi:**
```
🌱 Starting database seeding...
✅ Users created: 5
✅ Service types created: 4
✅ Pricing rules created: 13
✅ Sample orders created: 10
🎉 Database seeding completed successfully!

📋 Sample accounts:
Admin: admin / admin123
Staff: staff1 / staff123
Shipper: shipper1 / shipper123

🚀 You can now start the application with: npm start
```

### Bước 5: Chạy ứng dụng

```bash
# Development mode (với auto-reload)
npm run dev

# Production mode
npm start
```

**Truy cập ứng dụng:**
- URL: `http://localhost:3000`
- Admin panel sẽ tự động mở

## Tài khoản đăng nhập mặc định

| Vai trò | Username | Password | Quyền hạn |
|---------|----------|----------|-----------|
| **Admin** | `admin` | `admin123` | Toàn quyền quản lý |
| **Staff** | `staff1` | `staff123` | Quản lý đơn hàng |
| **Shipper** | `shipper1` | `shipper123` | Xem và cập nhật trạng thái đơn hàng |

## Kiểm tra cài đặt

### 1. Kiểm tra Database Connection
```bash
# Test kết nối database
node -e "
const { sequelize } = require('./models');
sequelize.authenticate()
  .then(() => console.log('✅ Database connection successful'))
  .catch(err => console.error('❌ Database connection failed:', err));
"
```

### 2. Kiểm tra API Endpoints

**Test với curl:**
```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test get users (cần token)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Kiểm tra Frontend
- Mở browser tại `http://localhost:3000`
- Đăng nhập với tài khoản admin
- Kiểm tra các chức năng:
  - Dashboard hiển thị thống kê
  - Quản lý người dùng
  - Quản lý bảng giá
  - Quản lý đơn hàng

## Troubleshooting

### Lỗi Database Connection
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Giải pháp:**
1. Kiểm tra PostgreSQL service đang chạy
2. Kiểm tra port trong `.env` file
3. Kiểm tra username/password database

### Lỗi "relation does not exist"
```
❌ Error: relation "users" does not exist
```
**Giải pháp:**
1. Chạy `npm run init-db` để tạo các bảng trước
2. Sau đó chạy `npm run seed` để thêm dữ liệu
3. Hoặc chạy `npm run setup` để làm cả hai bước

### Lỗi JWT Secret
```
❌ Error: secretOrPrivateKey must have a value
```
**Giải pháp:**
1. Kiểm tra file `.env` có JWT_SECRET
2. Đảm bảo JWT_SECRET không để trống

### Lỗi Port đã được sử dụng
```
❌ Error: listen EADDRINUSE :::3000
```
**Giải pháp:**
1. Thay đổi PORT trong `.env`
2. Hoặc kill process đang sử dụng port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill
   ```

### Lỗi Module không tìm thấy
```
❌ Error: Cannot find module 'sequelize'
```
**Giải pháp:**
```bash
npm install
# Hoặc
rm -rf node_modules package-lock.json
npm install
```

## Cấu trúc Database

### Tables được tạo tự động:
- `users` - Thông tin người dùng
- `service_types` - Loại dịch vụ
- `pricing` - Bảng giá
- `orders` - Đơn hàng

### Indexes được tạo:
- `users.username` (unique)
- `users.email` (unique)
- `orders.orderCode` (unique)
- `orders.senderPhone` (index)
- `orders.receiverPhone` (index)

## Backup và Restore

### Backup Database:
```bash
pg_dump -h localhost -U admin_user -d web_admin_db > backup.sql
```

### Restore Database:
```bash
psql -h localhost -U admin_user -d web_admin_db < backup.sql
```

## Performance Tuning

### Database Optimization:
```sql
-- Tạo indexes cho tìm kiếm
CREATE INDEX idx_orders_search ON orders USING gin(to_tsvector('english', order_code || ' ' || sender_name || ' ' || receiver_name));
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### Application Optimization:
```bash
# Sử dụng PM2 cho production
npm install -g pm2
pm2 start server.js --name "web-admin"
pm2 save
pm2 startup
```

## Security Checklist

- [ ] Thay đổi JWT_SECRET trong production
- [ ] Sử dụng HTTPS trong production
- [ ] Cấu hình firewall cho database
- [ ] Backup database định kỳ
- [ ] Cập nhật dependencies thường xuyên
- [ ] Sử dụng environment variables cho sensitive data

## Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs trong console
2. Network tab trong browser DevTools
3. Database connection status
4. File `.env` configuration

**Liên hệ:** student@university.edu
