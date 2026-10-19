# DevForge 🛠️

> **DevForge** là bộ công cụ tiện ích dành cho lập trình viên (Developer Toolbox & Cockpit) hoạt động hoàn toàn trên trình duyệt, kết hợp các công cụ xử lý dữ liệu tiện lợi với một REST API Client trực quan, hiện đại và bảo mật.

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vite.dev/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5%2B-1677ff.svg)](https://ant.design/)
[![Axios](https://img.shields.io/badge/Axios-1.x-5a29e4.svg)](https://axios-http.com/)
[![Tests](https://img.shields.io/badge/Vitest-49%20passed-brightgreen.svg)](https://vitest.dev/)
[![Version](https://img.shields.io/badge/Version-1.3.0-blue.svg)]()

---

## 📌 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt & Hướng dẫn chạy](#-cài-đặt--hướng-dẫn-chạy)
- [Chính sách bảo mật & CORS](#-chính-sách-bảo-mật--cors)
- [Lịch sử phiên bản (Changelog)](#-lịch-sử-phiên-bản-changelog)
- [Quy tắc cập nhật tài liệu](#-quy-tắc-cập-nhật-tài-liệu)

---

## 🌟 Tổng quan

DevForge được xây dựng theo kiến trúc Single Page Application (SPA), chạy 100% phía client (in-browser execution). Người dùng có thể xử lý dữ liệu và gửi HTTP request trực tiếp mà không cần backend trung gian, đảm bảo tốc độ cao, giao diện mượt mà và an toàn quyền riêng tư.

---

## 🚀 Tính năng chính

### 1. Data Utilities (Công cụ xử lý dữ liệu)
- **JSON Formatter & Validator (F-01):** Định dạng JSON 2 spaces, 4 spaces hoặc Minify; kiểm tra tính hợp lệ theo RFC 8259, hiển thị vị trí lỗi cú pháp (dòng, cột); giữ nguyên nội dung khi gặp lỗi.
- **Base64 Multi-Format Suite (F-02):**
  - **Text / String:** Mã hóa và giải mã an toàn UTF-8 (tiếng Việt có dấu, emoji).
  - **Base64URL:** Hỗ trợ chuẩn RFC 4648 §5 (ký tự `-`, `_`), tùy chọn lược bỏ padding cho JWT/URL.
  - **Hex Bytes <-> Base64:** Chuyển đổi 2 chiều giữa chuỗi Hex và Base64 (hỗ trợ phân tách dấu cách).
  - **File & Image Data URL:** Kéo thả tệp/ảnh để tạo Data URL, mã nhúng HTML `<img>`, xem trước ảnh trực tiếp và tải file nhị phân về máy.
  - **Line Wrap:** Tùy chọn ngắt dòng 64 ký tự (PEM) hoặc 76 ký tự (MIME).
- **UUID v4 Generator (F-03):** Sinh UUID Version 4 chuẩn RFC 4122 từ 1 đến 100 mã; tùy chọn chữ hoa/thường và dấu gạch nối; sử dụng Web Crypto (`crypto.randomUUID()` và `crypto.getRandomValues()`).
- **Timestamp Converter (F-04):** Chuyển đổi Unix timestamp (giây & mili-giây) sang UTC (ISO 8601), Local time và thời gian tương đối ("5 minutes ago"); chuyển đổi từ Date Picker sang timestamp; hiển thị đồng hồ epoch theo thời gian thực.
- **URL Encoder / Decoder (F-05):** Hỗ trợ chế độ URL Component (`encodeURIComponent`) và Full URL (`encodeURI`); xử lý chuỗi Unicode và báo lỗi percent-encoding không hợp lệ.
- **Regex Tester & Builder (F-15):**
  - Kiểm tra biểu thức chính quy theo thời gian thực với các cờ flags (`g`, `i`, `m`, `s`, `u`).
  - Highlight trực quan các đoạn văn bản khớp với tooltip vị trí index.
  - Bóc tách chi tiết Capture Groups và Named Groups (`(?<name>...)`).
  - Chế độ Thay Thế (Substitution / Replace) với hỗ trợ cú pháp `$1`, `$2`, `$&`.
  - Trình tạo biểu thức chính quy nhanh (Regex Generator).
  - Thư viện mẫu có sẵn (Email, SĐT Việt Nam, Web URL, IPv4, Hex Color, Date ISO, Strong Password, Tiếng Việt Unicode, Slug, HTML Tag).
  - Bảng tra cứu cú pháp nhanh (Cheat Sheet).

### 2. REST API Cockpit (Kiểm thử HTTP API)
- **In-Browser REST Client (F-09):** Hỗ trợ đầy đủ các phương thức `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- **Query Params & Headers Editor:** Bảng chỉnh sửa Key-Value trực quan với tùy chọn bật/tắt từng trường.
- **Payload & Body Options:** Hỗ trợ `none`, `JSON (application/json)` có nút làm đẹp/kiểm tra cú pháp trước khi gửi, và `Raw Text (text/plain)`.
- **Authentication (F-12):** Hỗ trợ `Bearer Token` và `API Key` (gửi qua Header hoặc Query Parameter) với nút ẩn/hiện giá trị an toàn.
- **Response Viewer (F-11 & F-14):** Hiển thị HTTP Status Code, thời gian phản hồi (ms), dung lượng dữ liệu, Content-Type, xem dưới dạng JSON có format hoặc text thô, nút sao chép và tải file response.
- **Cơ chế kiểm soát:** Nút Cancel request bằng `AbortController`, timeout mặc định 30s, chống spam/click kép, giới hạn an toàn 5MB tránh đơ trình duyệt.
- **Predefined APIs Explorer (F-10):** Tích hợp sẵn mẫu API công khai có CORS như **JSONPlaceholder** và **DummyJSON**; hỗ trợ tính năng **Quick Run** và **Open in API Client**.

### 3. Trải nghiệm & Giao diện (F-06, F-07, F-08)
- Giao diện Cockpit phong cách lập trình viên hiện đại, mặc định kích hoạt giao diện tối (**Dark Mode**) và hỗ trợ lưu trạng thái tùy chọn qua `localStorage`.
- Thanh tìm kiếm lọc công cụ theo thời gian thực.
- Tiện ích Clipboard thống nhất với thông báo feedback trực quan và cơ chế fallback.
- Thiết kế responsive tối ưu cho cả desktop lẫn thiết bị di động.

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| **Core UI** | React | 19.x |
| **Language** | TypeScript | 5.x / 7.x (Strict mode) |
| **Bundler** | Vite | 8.x |
| **Design System** | Ant Design (`antd`) & `@ant-design/icons` | 5.x / 6.x |
| **HTTP Client** | Axios + `AbortController` | ^1.x |
| **Testing** | Vitest | 5.x |
| **Date Time** | Day.js | 1.x |

---

## 📂 Cấu trúc thư mục

```text
DevForge/
├── .agents/                    # Quy tắc và hướng dẫn của AI Agent
├── public/                     # Static assets công khai
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI (CopyButton, StatusBadge, CorsInfoModal)
│   │   └── layout/             # Shell, Header, Sidebar, Layout chính
│   ├── integrations/           # Cấu hình các API định sẵn (JSONPlaceholder, DummyJSON)
│   ├── services/
│   │   └── http/               # HTTP client, request builder, response parser, error mapper
│   ├── tools/                  # Các module công cụ độc lập (Kiến trúc Component hóa)
│   │   ├── json-formatter/     # Formatter & Validator JSON
│   │   ├── base64/             # Base64 Multi-Format Suite
│   │   │   └── components/     # Subcomponents: Text, File, Hex tabs
│   │   ├── uuid/               # UUID v4 Generator
│   │   ├── timestamp/          # Timestamp Converter
│   │   ├── url-encoder/        # URL Encoder / Decoder
│   │   ├── regex-tester/       # Regex Tester & Builder
│   │   │   └── components/     # Subcomponents: PatternBar, Preview, Matches, Replace, Modals
│   │   ├── api-client/         # REST API Client Cockpit
│   │   │   └── components/     # Subcomponents: UrlBar, Params, Headers, Body, Auth, ResponseViewer
│   │   └── api-explorer/       # Predefined APIs Explorer (JSONPlaceholder, DummyJSON)
│   ├── types/                  # TypeScript interface và type definitions
│   ├── utils/                  # Hàm logic thuần túy (JSON, Base64, UUID, URL, Timestamp, Clipboard)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # Theme tokens, font JetBrains Mono & Inter
├── DEVFORGE_REQUIREMENT.md     # Tài liệu đặc tả hệ thống gốc
├── DEVFORGE.md                 # Tóm tắt kỹ thuật & trạng thái cập nhật dự án
├── README.md                   # Tài liệu hướng dẫn sử dụng & tổng quan
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 💻 Cài đặt & Hướng dẫn chạy

### Yêu cầu môi trường
- **Node.js:** phiên bản >= 18 (khuyên dùng Node 20 hoặc 24 LTS)
- **NPM:** phiên bản >= 9

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173/`

### 3. Chạy bộ kiểm thử (Unit Tests)
```bash
npm test
```
Chạy chế độ theo dõi (watch mode):
```bash
npm run test:watch
```

### 4. Build sản phẩm (Production)
```bash
npm run build
npm run preview
```

---

## 🔒 Chính sách bảo mật & CORS

1. **Bảo vệ Credential:**
   - DevForge **KHÔNG BAO GIỜ** lưu token xác thực hoặc API key vào `localStorage`, `sessionStorage` hay cookies.
   - Toàn bộ credential chỉ được giữ trong bộ nhớ (in-memory state) trong phiên làm việc hiện tại.
2. **Cơ chế CORS của trình duyệt:**
   - Vì chạy trực tiếp trên trình duyệt, các request đến domain khác phải tuân thủ chính sách CORS của server đích (server phải phản hồi header `Access-Control-Allow-Origin`).
   - Ứng dụng cung cấp sẵn hướng dẫn và modal giải thích chi tiết khi xảy ra lỗi mạng / CORS để nhà phát triển hiểu rõ nguyên nhân.

---

## 📝 Lịch sử phiên bản (Changelog)

### [1.3.0] - 19/10/2026 (Architecture Modularization & Refactoring)
- **Tái cấu trúc mã nguồn (Refactoring & De-monolithization):**
  - Phân rã toàn bộ các file công cụ đơn khối lớn (>600 - 750 dòng) thành các subcomponents độc lập, dễ bảo trì và mở rộng trong thư mục `components/` của từng tool.
  - **REST API Client (`src/tools/api-client/components/`):**
    - `RequestUrlBar.tsx`: Thanh cấu hình HTTP Method, URL endpoint và nút kích hoạt/hủy request.
    - `ParamsTab.tsx`: Bảng quản lý Query Parameters dạng Key-Value (bật/tắt linh hoạt).
    - `HeadersTab.tsx`: Bảng quản lý Request Headers dạng Key-Value.
    - `BodyTab.tsx`: Trình biên tập Payload (JSON/Raw) có tính năng kiểm tra lỗi cú pháp và làm đẹp tự động.
    - `AuthTab.tsx`: Cấu hình xác thực Bearer Token, API Key (Header/Query) kèm tính năng che mật khẩu.
    - `ResponseViewer.tsx`: Bảng hiển thị kết quả phản hồi HTTP (status, metrics, headers, formatted JSON tree, raw text, copy & download).
  - **Base64 Multi-Format Suite (`src/tools/base64/components/`):**
    - `Base64TextTab.tsx`: Xử lý văn bản UTF-8, Base64URL, tùy chọn padding và ngắt dòng.
    - `Base64FileTab.tsx`: Xử lý kéo thả tệp, sinh Data URL, mã nhúng thẻ `<img>`, preview ảnh và tải file nhị phân.
    - `Base64HexTab.tsx`: Chuyển đổi 2 chiều Hex Bytes <-> Base64.
  - **Regex Tester & Builder (`src/tools/regex-tester/components/`):**
    - `RegexPatternBar.tsx`: Nhập biểu thức chính quy, thông báo lỗi cú pháp và bật tắt cờ flags.
    - `RegexHighlightPreview.tsx`: Hiển thị highlight trực quan các đoạn khớp theo vị trí index và thống kê số lượng khớp.
    - `RegexMatchesList.tsx`: Danh sách bóc tách chi tiết capture groups và named groups.
    - `RegexReplaceTab.tsx`: Playground thay thế chuỗi (substitution) hỗ trợ cú pháp `$1`, `$2`, `$&`.
    - `RegexBuilderModal.tsx`: Modal tạo nhanh biểu thức chính quy theo cấu hình trực quan.
    - `RegexCheatSheetModal.tsx`: Modal tra cứu cú pháp Regex cheat sheet dạng bảng.
- **Tích hợp Axios cho toàn bộ tầng HTTP Client (`src/services/http/`):**
  - Chuyển đổi động cơ gửi request từ Fetch API sang **Axios** chuyên dụng.
  - Cấu hình `validateStatus: () => true` giúp hiển thị đầy đủ chi tiết response từ server kể cả với mã trạng thái lỗi 4xx và 5xx.
  - Tích hợp `AbortController.signal` cho chức năng Cancel Request tức thời.
  - Xử lý và ánh xạ chuẩn hóa các mã lỗi Axios: `ERR_NETWORK` (CORS/Network error), `ECONNABORTED` (Request Timeout), `ERR_CANCELED` (User abort).
- **Tối ưu hóa kiểm thử & build:**
  - Cấu hình Vitest tối ưu (`fileParallelism: false`) giải quyết triệt để cảnh báo cạn kiệt bộ nhớ worker trên Windows.
  - Mở rộng bộ kiểm thử lên **49/49 unit tests passed** (8/8 test suites đạt 100%), build production bundle tối ưu không lỗi.

### [1.2.0] - 19/10/2026 (Feature Expansion)
- **Công cụ mới — Regex Tester & Builder (`F-15`):**
  - Kiểm tra biểu thức chính quy trực quan theo thời gian thực với các cờ `g`, `i`, `m`, `s`, `u`.
  - Highlight trực quan vị trí và nội dung khớp trong đoạn văn bản.
  - Bóc tách chi tiết Capture Groups ($1, $2,...) và Named Groups.
  - Chế độ Thay Thế (Substitution / Replace) với hỗ trợ token đặc biệt.
  - Trình tạo Regex tự động (Quick Builder) theo các tiêu chí (chữ số, chữ cái, anchor, quantifier).
  - Tích hợp 10+ mẫu Regex phổ biến (Email, SĐT VN, Web URL, IPv4, Hex Color, Date ISO, Strong Password, Tiếng Việt có dấu, Kebab Slug, HTML Tag).
  - Modal Bảng tra cứu cú pháp nhanh (Cheat Sheet).
- **Mở rộng bộ công cụ Base64 Multi-Format Suite (`F-02`):**
  - Hỗ trợ chuẩn URL-Safe Base64 (Base64URL — RFC 4648 §5) với cờ tắt/bật padding (`=`).
  - Chuyển đổi 2 chiều giữa Hex Bytes và Base64 (hỗ trợ phân tách khoảng trắng).
  - Kéo thả tệp/ảnh tạo Data URL, mã HTML `<img>`, xem trước hình ảnh trực tiếp và tải file nhị phân đã giải mã.
  - Tùy chọn ngắt dòng 64 ký tự (PEM) và 76 ký tự (MIME).
- **Mở rộng kiểm thử:** Bổ sung unit tests cho Regex engine và Base64 mở rộng (46/46 tests passed).

### [1.1.0] - 19/10/2026 (MVP Release)
- **Khởi tạo dự án:** Thiết lập source code React 19 + TypeScript + Vite + Ant Design.
- **Hoàn thành các công cụ cốt lõi:**
  - `F-01`: JSON Formatter & Validator (2 spaces, 4 spaces, Minify, Error highlighting).
  - `F-02`: Base64 Encoder / Decoder (UTF-8 tiếng Việt & emoji safe).
  - `F-03`: UUID v4 Generator (1-100 count, uppercase, hyphens options).
  - `F-04`: Timestamp Converter (Unix epoch s/ms to UTC, Local, Relative time, Date picker).
  - `F-05`: URL Encoder / Decoder (Component & Full URL modes, Unicode).
  - `F-06` – `F-08`: Application Shell, Live Search, Unified Clipboard, Responsive design.
  - `F-09`: In-browser REST API Client (GET, POST, PUT, PATCH, DELETE, Params/Headers/Body/Auth tabs).
  - `F-10`: Predefined APIs Explorer (JSONPlaceholder & DummyJSON).
  - `F-11`: Response Viewer (Status, duration, headers, formatted JSON body, raw view, download).
  - `F-12`: API Authentication (Bearer token, API key header/query, credential masking).
  - `F-13`: Error handling & CORS guide modal.
  - `F-14`: Request controls (AbortController, 30s timeout, 5MB response cap, anti-duplicate click).
- **Kiểm thử:** Viết 34 unit tests với Vitest, 100% passed.

---

## 📜 Quy tắc cập nhật tài liệu

> **BẮT BUỘC:** Mỗi khi bổ sung chức năng mới, thay đổi luồng xử lý hoặc nâng cấp phiên bản:
> 1. Cập nhật file **`README.md`** (cập nhật mô tả tính năng, hướng dẫn sử dụng, cấu hình và bảng changelog).
> 2. Cập nhật file **`DEVFORGE.md`** (cập nhật chi tiết kỹ thuật, trạng thái tính năng, cấu trúc file, mô hình dữ liệu).
