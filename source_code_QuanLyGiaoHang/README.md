# Web Admin System - Đồ án Công nghệ Phần mềm Nâng cao

## Mô tả dự án

Hệ thống Web Admin được phát triển cho Sprint 1 của đồ án Công nghệ Phần mềm Nâng cao, bao gồm các chức năng cốt lõi:

- **Quản lý người dùng** (staff, shipper, role/permission)
- **Quản lý bảng báo giá & loại dịch vụ**
- **Tìm kiếm & lọc đơn hàng**

## Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **HTML5/CSS3** - Markup và styling
- **Bootstrap 5** - UI framework
- **JavaScript (ES6+)** - Client-side logic
- **Chart.js** - Data visualization
- **Font Awesome** - Icons

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (v14 trở lên)
- PostgreSQL (v12 trở lên)
- npm hoặc yarn

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd web-admin-system
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình database
1. Tạo database PostgreSQL:
```sql
CREATE DATABASE web_admin_db;
```

2. Cập nhật file `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=web_admin_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=development
```

### Bước 4: Khởi tạo dữ liệu mẫu
```bash
node scripts/seed.js
```

### Bước 5: Chạy ứng dụng
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Truy cập ứng dụng tại: `http://localhost:3000`

## Tài khoản mặc định

Sau khi chạy script seed, bạn có thể đăng nhập với:

- **Admin**: username: `admin`, password: `admin123`
- **Staff**: username: `staff1`, password: `staff123`
- **Shipper**: username: `shipper1`, password: `shipper123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/logout` - Đăng xuất

### User Management (Admin only)
- `GET /api/users` - Lấy danh sách người dùng
- `POST /api/users` - Tạo người dùng mới
- `GET /api/users/:id` - Lấy thông tin người dùng
- `PUT /api/users/:id` - Cập nhật người dùng
- `DELETE /api/users/:id` - Xóa người dùng
- `PATCH /api/users/:id/toggle-status` - Bật/tắt tài khoản

### Pricing Management
- `GET /api/pricing/service-types` - Lấy danh sách loại dịch vụ
- `POST /api/pricing/service-types` - Tạo loại dịch vụ mới
- `PUT /api/pricing/service-types/:id` - Cập nhật loại dịch vụ
- `DELETE /api/pricing/service-types/:id` - Xóa loại dịch vụ
- `GET /api/pricing` - Lấy danh sách bảng giá
- `POST /api/pricing` - Tạo bảng giá mới
- `PUT /api/pricing/:id` - Cập nhật bảng giá
- `DELETE /api/pricing/:id` - Xóa bảng giá
- `POST /api/pricing/calculate-cost` - Tính phí vận chuyển

### Order Management
- `GET /api/orders` - Lấy danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders/:id` - Lấy thông tin đơn hàng
- `PUT /api/orders/:id` - Cập nhật đơn hàng
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái đơn hàng
- `DELETE /api/orders/:id` - Xóa đơn hàng
- `GET /api/orders/stats/overview` - Thống kê đơn hàng

## Cấu trúc dự án

```
web-admin-system/
├── config/
│   └── database.js          # Cấu hình database
├── middleware/
│   └── auth.js             # Middleware xác thực
├── models/
│   └── index.js            # Database models
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User management routes
│   ├── pricing.js          # Pricing management routes
│   └── orders.js           # Order management routes
├── public/
│   ├── css/
│   │   └── style.css       # Custom styles
│   ├── js/
│   │   └── app.js          # Main JavaScript
│   └── index.html          # Main HTML file
├── scripts/
│   └── seed.js             # Database seeding script
├── .env                    # Environment variables
├── package.json            # Dependencies
├── server.js               # Main server file
└── README.md               # Documentation
```

## Tính năng chính

### 1. Quản lý người dùng
- Tạo, sửa, xóa người dùng
- Phân quyền theo role (admin, staff, shipper)
- Tìm kiếm và lọc người dùng
- Bật/tắt tài khoản

### 2. Quản lý bảng báo giá
- Quản lý loại dịch vụ
- Thiết lập bảng giá theo trọng lượng
- Tính phí bổ sung (dễ vỡ, giá trị cao)
- Tính toán phí vận chuyển tự động

### 3. Quản lý đơn hàng
- Tạo và quản lý đơn hàng
- Tìm kiếm đa tiêu chí (mã đơn, tên, số điện thoại)
- Lọc theo trạng thái, dịch vụ, ngày
- Cập nhật trạng thái đơn hàng
- Thống kê và báo cáo

### 4. Dashboard
- Thống kê tổng quan
- Biểu đồ trạng thái đơn hàng
- Danh sách đơn hàng gần đây

## Bảo mật

- Xác thực JWT
- Mã hóa mật khẩu với bcrypt
- Phân quyền RBAC (Role-Based Access Control)
- Validation đầu vào
- CORS configuration

## Testing

Sử dụng Postman để test API:

1. Import collection từ file `postman_collection.json`
2. Cấu hình environment variables
3. Chạy các test cases

## Deployment

### Production
1. Cập nhật `NODE_ENV=production` trong `.env`
2. Cấu hình database production
3. Chạy `npm start`

### Docker (Optional)
```bash
docker build -t web-admin-system .
docker run -p 3000:3000 web-admin-system
```

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## Liên hệ

- Email: student@university.edu
- Project: Đồ án Công nghệ Phần mềm Nâng cao
- Sprint: Sprint 1 (26/09/2025 - 30/09/2025)
