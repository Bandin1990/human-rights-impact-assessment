# วิธีแก้ปัญหา PDF อ่านไม่ได้ (404 Error)

## ปัญหาที่พบ
```
cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.394/pdf.worker.min.js:1  
Failed to load resource: the server responded with a status of 404 ()
```

## สาเหตุ
Worker file ที่ CDN ไม่มีเวอร์ชันที่ตรงกับ pdfjs-dist ที่ติดตั้ง

## วิธีแก้ไข

### ขั้นตอนที่ 1: แก้ไขไฟล์ `src/pages/AssessmentForm.jsx`

**1.1 เพิ่ม import ที่บรรทัด 7:**
```javascript
import * as pdfjsLib from 'pdfjs-dist';
```

**ตำแหน่ง:** หลังบรรทัด `import { analyzeProject } from '../services/ai';`

**1.2 แก้ไขฟังก์ชัน `readPDFFile` (บรรทัด 25-31):**

**เดิม:**
```javascript
const readPDFFile = async (file) => {
    try {
        const pdfjsLib = await import('pdfjs-dist');

        // Set worker path - use HTTPS for reliability
        const pdfjsVersion = pdfjsLib.version || '3.11.174';
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
```

**ใหม่:**
```javascript
const readPDFFile = async (file) => {
    try {
        // Use worker from node_modules
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.mjs',
            import.meta.url
        ).toString();
```

### ขั้นตอนที่ 2: บันทึกและ Hard Refresh

1. บันทึกไฟล์ (Ctrl+S)
2. Hard Refresh เบราว์เซอร์:
   - กด `Ctrl + Shift + R`
   - หรือ `Ctrl + F5`

### ขั้นตอนที่ 3: ทดสอบ

1. เปิด Developer Tools (F12)
2. ไปที่แท็บ Console
3. อัปโหลดไฟล์ PDF
4. ดูว่ามีข้อความ "PDF loaded: X pages" หรือไม่

## ถ้ายังไม่ได้

### แนวทางที่ 1: ใช้ CDN เวอร์ชันอื่น
แทนที่โค้ดด้วย:
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
    'https://unpkg.com/pdfjs-dist@5.4.394/build/pdf.worker.mjs';
```

### แนวทางที่ 2: Copy worker file เข้า public folder
```bash
# ใน terminal
cp node_modules/pdfjs-dist/build/pdf.worker.mjs public/
```

แล้วแก้โค้ดเป็น:
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
```

## หมายเหตุ

- ไฟล์ PDF ต้องเป็น PDF ที่มี text layer (ไม่ใช่ scanned PDF)
- ถ้าเป็น scanned PDF จะต้องใช้ OCR ก่อน
- ตรวจสอบ Console เสมอเพื่อดู error messages
