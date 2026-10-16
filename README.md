# Hệ thống Tờ khai Điện tử & Hướng dẫn Thủ tục Hành chính Công
## Trung tâm Cung ứng Dịch vụ công phường Đông Hưng Thuận, Quận 12, TP. Hồ Chí Minh

Ứng dụng web tĩnh cao cấp (100% Static Web Application) phục vụ công dân thực hiện tra cứu thủ tục, xem mẫu hướng dẫn, điền tờ khai điện tử trực quan và in tờ khai khổ giấy A4 chuẩn thể thức hành chính Nhà nước theo Nghị định 30/2020/NĐ-CP.

Hệ thống được thiết kế độc lập, không yêu cầu máy chủ cơ sở dữ liệu hay NodeJS backend, sẵn sàng để đưa lên **Plesk Shared Hosting (Mắt Bão)** hoặc bất kỳ máy chủ tĩnh / GitHub Pages / Cloudflare Pages trong 1 phút.

---

## 🏛️ Đơn vị chủ quản & Nhận diện thương hiệu

- **Cơ quan:** Trung tâm Cung ứng Dịch vụ công phường Đông Hưng Thuận (UBND Phường Đông Hưng Thuận, Quận 12, TP. Hồ Chí Minh)
- **Khẩu hiệu (Slogan):** *"Thực hiện trực tuyến – Nhanh chóng – Thuận tiện – An toàn"*
- **Địa chỉ:** Đường Nguyễn Văn Quá, Khu phố 3, Phường Đông Hưng Thuận, Quận 12, TP. Hồ Chí Minh
- **Đường dây nóng:** (028) 3891 0403
- **Thư điện tử:** donghungthuan.q12@tphcm.gov.vn
- **Màu sắc nhận diện:** Xanh hành chính đậm (`#0F4C81` / `#1E40AF`), Vàng ấm GovTech (`#D97706`), Đỏ cờ hoa (`#DC2626`), Nền Slate thanh lịch (`#F8FAFC`).
- **Phông chữ:** `Be Vietnam Pro` (Giao diện hiển thị hiện đại) và `Times New Roman` (Quy chuẩn bản in văn bản hành chính A4).

---

## ✨ Các tính năng nổi bật (Citizen-First GovTech)

### 1. Tìm kiếm thông minh không dấu tiếng Việt
- Thuật toán loại bỏ dấu tiếng Việt tự động (`removeVietnameseTones`).
- Người dân gõ `"khai sinh"`, `"ket hon"`, `"doc than"`, `"sao y"`, `"tam tru"`, `"cu tru"` là tìm thấy ngay biểu mẫu cần thiết.
- Tích hợp sẵn các chip tìm kiếm nhanh cho các thủ tục phổ biến nhất.

### 2. Điền tờ khai tương tác & Trình duyệt bản in A4 thời gian thực (Split-Screen Live A4 Preview)
- Màn hình chia đôi:
  - **Cột trái:** Các ô nhập thông tin thông minh (tự động viết hoa Họ tên, định dạng ngày sinh, kiểm tra 12 số CCCD, trợ giúp hướng dẫn điền cho từng ô).
  - **Cột phải:** Mô phỏng tờ giấy A4 thực tế với Quốc hiệu & Tiêu ngữ, tiêu đề tờ khai, cơ quan tiếp nhận tại Đông Hưng Thuận, các trường dữ liệu tự động điền vào chỗ chấm chấm `....................`, và khung ký tên chuẩn.
- Nút bật/tắt **"Dữ liệu mẫu chuẩn"**: Cho phép công dân xem một bản khai mẫu hoàn chỉnh để so sánh và đối chiếu.
- Nút **"🖨️ In Tờ Khai / Lưu PDF (Khổ A4)"**: Sử dụng bộ quy tắc `@media print` chuyên biệt, ẩn hoàn toàn giao diện web, chỉ in trang văn bản A4 sạch đẹp, chuẩn lề theo quy định.

### 3. "👤 Thông tin của tôi" – Lưu trữ hồ sơ & Điền tự động 1-Click
- Người dân có thể lưu thông tin cơ bản (Họ tên, Ngày sinh, CCCD, Ngày cấp, Nơi cấp, Số điện thoại, Địa chỉ thường trú tại Đông Hưng Thuận) vào trình duyệt của mình.
- Dữ liệu lưu trong `localStorage` cá nhân, tuyệt đối bảo mật, không gửi lên bất kỳ máy chủ nào.
- Khi mở bất kỳ tờ khai nào, người dân chỉ cần bấm nút **"⚡ Tự động điền thông tin cá nhân của tôi"**, hệ thống sẽ tự khớp các trường dữ liệu ngay lập tức.

### 4. "A+ Chữ to" – Hỗ trợ người cao tuổi
- Nút chuyển đổi nhanh chế độ tiếp cận cho người lớn tuổi: Tăng cỡ chữ lên 125%, tăng độ tương phản, phóng to ô nhập liệu và các nút bấm để thao tác dễ dàng mà không bị mỏi mắt.

### 5. "📋 Giấy tờ cần mang theo" (Checklist tương tác)
- Hiển thị danh mục hồ sơ cần chuẩn bị (phân loại rõ: *Bản chính*, *Bản sao*, *Bản chứng thực*).
- Kèm thanh tiến độ đếm số giấy tờ công dân đã tích chọn chuẩn bị xong (ví dụ: `2/3 giấy tờ`), kèm các cảnh báo lưu ý hành chính quan trọng.

### 6. "📱 Mã QR / Tải file" & Hỗ trợ Deep Link
- Tạo mã QR động dẫn trực tiếp vào biểu mẫu tương ứng qua tham số đường dẫn (ví dụ: `?form=khai-sinh`, `?form=cu-tru-ct01`).
- Hỗ trợ tải file ảnh QR định dạng PNG để cán bộ in dán tại bàn tiếp nhận một cửa.
- Nút tải file Word/PDF trắng nếu đơn vị có đính kèm file ngoài.

---

## ⚙️ Admin Studio (`⚙️`) & Xuất bản Hosting Plesk Mắt Bão

Hệ thống tích hợp bảng điều khiển Quản trị viên (Admin Studio) được bảo vệ bằng mã PIN (Mặc định: **`1234`**, có thể đổi trong giao diện).

### Tab 1: Nhận diện & Logo Cơ quan
- Chỉnh sửa tên đơn vị, khẩu hiệu, địa chỉ, hotline, cơ quan tiếp nhận, mã PIN quản trị.
- **Tải ảnh Logo từ máy tính (Tự động nhúng Base64):** Chọn bất kỳ file ảnh nào từ máy tính, hệ thống sẽ tự động dùng `<canvas>` nén và chuyển thành chuỗi `data:image/png;base64,...`, lưu vào cấu hình để có thể xuất thành 1 file duy nhất!

### Tab 2: Quản lý Biểu mẫu (CRUD & Visual Field Editor)
- Thêm mới, Chỉnh sửa, Nhân bản, Xóa bất kỳ biểu mẫu nào.
- Trình tạo trường dữ liệu trực quan: Thay đổi nhãn (label), kiểu nhập (text, textarea, select, phone, number), placeholder, mẫu giá trị và ghi chú hướng dẫn.
- Quản lý danh mục giấy tờ cần mang theo (Checklist) cho từng thủ tục.

### Tab 3: Đóng gói & Triển khai Hosting Plesk Mắt Bão
- **`"🚀 Xuất trọn gói 1 file Web độc lập (index.html)"`**:
  Tính năng đột phá tuần tự hóa toàn bộ cấu hình mới nhất, Logo dạng Base64 và 8 biểu mẫu vào mã nguồn HTML và tải xuống file `index.html`.
- **`"📥 Xuất file dữ liệu (data.json)"`** & **`"📤 Nhập file dữ liệu (Import JSON)"`**: Sao lưu và phục hồi dữ liệu dễ dàng.
- **`"🔄 Khôi phục mặc định ban đầu"`**: Trở về cấu hình chuẩn ban đầu của Phường Đông Hưng Thuận.

---

## 📁 Cấu trúc Thư mục Dự án Đã được Tối ưu & Phân tách Module

Trước đây toàn bộ dự án dồn trong **1 file duy nhất với gần 6.000 dòng code**, gây khó khăn cho việc bảo trì và nâng cấp. Hiện tại hệ thống đã được phân tách thành các module chuyên biệt, sạch đẹp, dễ dàng bảo trì:

```
TTCI/
├── index.html              # Trang chủ ứng dụng, tinh gọn (~290 dòng)
├── logo.png                # Logo chính thức của Trung tâm
├── css/
│   └── style.css           # Toàn bộ CSS giao diện, Dark Mode, Glassmorphism & quy chuẩn in A4
└── js/
    ├── data-civil.js       # 20 mẫu tờ khai Hộ tịch & các hàm tiện ích tạo form (T, D, R, ln...)
    ├── data-docx.js        # 15 mẫu đơn hành chính (Đất đai, Xây dựng, BTXH...) & bộ xử lý Word
    ├── canvas.js           # Hiệu ứng hạt nước tương tác chuột 60fps (Hero Interactive Canvas)
    └── app.js              # Bộ điều khiển ứng dụng: Router, Live Search, Giọng nói, Xem trước & In
```

---

## 🛠️ Hướng dẫn Nâng cấp & Thêm Mẫu Đơn Mới sau này

Khi cần mở rộng thêm thủ tục hành chính hoặc chỉnh sửa mẫu có sẵn, bạn chỉ cần mở đúng file tương ứng:

### 1. Thêm / Sửa mẫu tờ khai Hộ tịch (Khai sinh, Kết hôn, Khai tử, Giám hộ...)
- **Mở file:** `js/data-civil.js`
- Tìm đến mảng `var FORMS = [ ... ];`
- Thêm một đối tượng mẫu mới với cấu trúc:
  ```javascript
  {
    id: 'ma-thu-tuc-moi',
    num: 21,
    group: 'Đăng ký lần đầu',
    title: 'Tên thủ tục hiển thị',
    docTitle: 'TIÊU ĐỀ IN TRÊN TỜ KHAI A4',
    fields: [
      SEC('Thông tin người yêu cầu'),
      T('hoTen', 'Họ và tên người yêu cầu'),
      D('ngaySinh', 'Ngày tháng năm sinh'),
      // ...
    ],
    body: function(v) {
      // Bố cục văn bản in xem trước
      return ln('Họ và tên', v.hoTen) + madeAtLine(v);
    }
  }
  ```

### 2. Thêm / Sửa mẫu đơn các mảng khác (Đất đai, Xây dựng, Bảo trợ xã hội, An toàn thực phẩm...)
- **Mở file:** `js/data-docx.js`
- Tìm đến mảng `var DOCX_FORMS = [ ... ];`
- Bạn có thể khai báo mẫu đơn mới kèm các ô điền trực tiếp vào văn bản mẫu. Khi in hệ thống sẽ giữ nguyên 100% bố cục gốc.

### 3. Tinh chỉnh màu sắc, phông chữ hoặc căn lề in ấn A4
- **Mở file:** `css/style.css`
- Phần giao diện hiển thị nằm ở nửa trên (`:root`, `.card`, `.btn`, `.topbar`...).
- Phần quy chuẩn lề in văn bản A4 nằm ở cuối file dưới `@media print`.

### 4. Điều chỉnh tính năng, tìm kiếm, lưu trữ hoặc âm thanh
- **Mở file:** `js/app.js`

---

## 🚀 Hướng dẫn Triển khai lên Hosting Plesk (Mắt Bão)

### Triển khai tại thư mục gốc (Root Domain)
1. Đăng nhập vào trang quản trị **Plesk Panel của Mắt Bão**.
2. Tìm đến tên miền của bạn, chọn **Files (Trình quản lý tập tin)**.
3. Mở thư mục **`httpdocs`**.
4. Xóa file `index.html` mặc định của Mắt Bão (nếu có).
5. Bấm nút **Upload (Tải lên)** toàn bộ thư mục và file:
   - `index.html`
   - Thư mục `css/` (chứa `style.css`)
   - Thư mục `js/` (chứa `data-civil.js`, `data-docx.js`, `canvas.js`, `app.js`)
   - `logo.png`
6. Mở trình duyệt truy cập: `https://ten-mien-cua-ban.vn/` là hệ thống chạy ngay lập tức mà không cần bất kỳ cài đặt nào khác!

### Triển khai tại thư mục con (ví dụ: `/tokhai/`)
1. Trong thư mục `httpdocs`, tạo thư mục mới tên là **`tokhai`**.
2. Tải `index.html`, thư mục `css/`, thư mục `js/` và `logo.png` vào bên trong `httpdocs/tokhai/`.
3. Truy cập: `https://ten-mien-cua-ban.vn/tokhai/`

---

## 📂 Danh mục 8 Biểu mẫu Chuẩn được Tích hợp sẵn

| STT | Mã biểu mẫu | Tên biểu mẫu | Lĩnh vực | Thời gian giải quyết | Lệ phí |
|:---:|:---|:---|:---|:---:|:---:|
| 1 | `Mẫu TP/HT-2024-KS` | Tờ khai đăng ký khai sinh | Tư pháp - Hộ tịch | Trong ngày | Miễn phí |
| 2 | `Mẫu TP/HT-2024-KH` | Tờ khai đăng ký kết hôn | Tư pháp - Hộ tịch | Trong ngày / 03 ngày | Miễn phí |
| 3 | `Mẫu TP/HT-2024-XNTTHN` | Tờ khai cấp Giấy xác nhận tình trạng hôn nhân | Tư pháp - Hộ tịch | Trong ngày | Miễn phí |
| 4 | `Mẫu TP/HT-2024-KT` | Tờ khai đăng ký khai tử | Tư pháp - Hộ tịch | Trong ngày | Miễn phí |
| 5 | `Mẫu TP/HT-2024-CMC` | Tờ khai đăng ký nhận cha, mẹ, con | Tư pháp - Hộ tịch | 03 ngày làm việc | Miễn phí |
| 6 | `Mẫu CT-01` | Phiếu yêu cầu chứng thực hợp đồng, giao dịch / Chữ ký | Chứng thực - Sao y | Trong ngày | 10.000 đ/trường hợp |
| 7 | `Mẫu CT01 - Cư trú` | Tờ khai thay đổi thông tin cư trú (Mẫu CT01) | Hành chính - Cư trú | 01 - 03 ngày làm việc | Miễn phí |
| 8 | `Mẫu BTXH-01` | Tờ khai đề nghị trợ cấp xã hội hàng tháng / Người cao tuổi | Lao động - BTXH | 07 ngày làm việc | Miễn phí |

---

## 🔒 Cam kết Bảo mật Dữ liệu Công dân

Hệ thống này được xây dựng trên kiến trúc **Client-Side First (Trình duyệt xử lý nội bộ)**:
- Mọi dữ liệu mà người dân nhập (Họ tên, CCCD, ngày sinh, địa chỉ gia đình) **chỉ tồn tại trong bộ nhớ tạm của trình duyệt** hoặc `localStorage` trên máy cá nhân của người dân nếu người dân chủ động bấm Lưu.
- Không có bất kỳ dữ liệu nhạy cảm nào được truyền tải qua máy chủ của bên thứ ba, đảm bảo tuân thủ nghiêm ngặt Luật Bảo vệ bí mật thông tin cá nhân và quy định chuyển đổi số quốc gia.
