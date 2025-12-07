# App Config API - Postman Collection

## Base URL
```
http://localhost:3000
```

## Authentication
Add this header to all Admin requests:
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 1. Get App Config (Public)

**Method:** `GET`  
**URL:** `{{base_url}}/api/app-config`  
**Auth:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "ad_text": "အကောင့်တွင်ငွေဖြည့်ပြီးအရောက်ပါက page တွင်ဆက်သွယ်ပြောဆိုပေးပါ",
    "tag": [
      { "tags": "Mobile Legends" },
      { "tags": "Pubg Mobile" }
    ],
    "view_pager": [
      { "image": "https://res.cloudinary.com/..." },
      { "image": "https://res.cloudinary.com/..." }
    ]
  }
}
```

---

## 2. Create/Update App Config (JSON only)

**Method:** `POST`  
**URL:** `{{base_url}}/api/app-config`  
**Auth:** Bearer Token (Admin)  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (raw JSON):**
```json
{
  "ad_text": "အကောင့်တွင်ငွေဖြည့်ပြီးအရောက်ပါက page တွင်ဆက်သွယ်ပြောဆိုပေးပါ",
  "tag": [
    { "tags": "Mobile Legends" },
    { "tags": "Pubg Mobile" }
  ],
  "view_pager": [
    { "image": "https://example.com/image1.jpg" },
    { "image": "https://example.com/image2.jpg" }
  ]
}
```

**Notes:**
- Tags must exist in Tag database first
- View pager can be URLs or uploaded via multipart (see next example)

---

## 3. Create/Update App Config (With Image Upload)

**Method:** `POST`  
**URL:** `{{base_url}}/api/app-config`  
**Auth:** Bearer Token (Admin)  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (form-data):**
```
Key: images          Type: File      Value: [Select image1.jpg]
Key: images          Type: File      Value: [Select image2.jpg]
Key: images          Type: File      Value: [Select image3.jpg]
Key: ad_text         Type: Text      Value: အကောင့်တွင်ငွေဖြည့်ပြီးအရောက်ပါက page တွင်ဆက်သွယ်ပြောဆိုပေးပါ
Key: replace_images  Type: Text      Value: true (optional - replaces all existing images)
```

**Notes:**
- Images will be uploaded to Cloudinary automatically
- Use `replace_images=true` to replace all existing images
- Without `replace_images`, new images will be appended

---

## 4. Update Ad Text Only

**Method:** `PUT`  
**URL:** `{{base_url}}/api/app-config/ad-text`  
**Auth:** Bearer Token (Admin)  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (raw JSON):**
```json
{
  "ad_text": "New ad text here"
}
```

---

## 5. Add Single Tag

**Method:** `POST`  
**URL:** `{{base_url}}/api/app-config/tags`  
**Auth:** Bearer Token (Admin)  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (raw JSON):**
```json
{
  "tags": "Mobile Legends"
}
```

**Notes:**
- Tag must exist in Tag database first
- Create tag via `POST /api/tags` if needed

---

## 6. Remove Tag by Index

**Method:** `DELETE`  
**URL:** `{{base_url}}/api/app-config/tags/0`  
**Auth:** Bearer Token (Admin)  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Notes:**
- Replace `0` with the index of tag you want to remove
- Index starts from 0

---

## 7. Add View Pager Image (Upload File)

**Method:** `POST`  
**URL:** `{{base_url}}/api/app-config/view-pager`  
**Auth:** Bearer Token (Admin)  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (form-data):**
```
Key: image    Type: File    Value: [Select banner.jpg]
```

**Response:**
```json
{
  "success": true,
  "message": "View pager image added successfully",
  "data": {
    "view_pager": [
      {
        "image": "https://res.cloudinary.com/depmtmpga/image/upload/v.../g2bulk/view-pager/..."
      }
    ]
  }
}
```

---

## 8. Add View Pager Image (URL)

**Method:** `POST`  
**URL:** `{{base_url}}/api/app-config/view-pager`  
**Auth:** Bearer Token (Admin)  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Body (raw JSON):**
```json
{
  "image": "https://example.com/banner.jpg"
}
```

---

## 9. Remove View Pager Image by Index

**Method:** `DELETE`  
**URL:** `{{base_url}}/api/app-config/view-pager/0`  
**Auth:** Bearer Token (Admin)  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Notes:**
- Replace `0` with the index of image you want to remove
- Index starts from 0

---

## 10. Delete Entire App Config

**Method:** `DELETE`  
**URL:** `{{base_url}}/api/app-config`  
**Auth:** Bearer Token (Admin)  
**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "App config deleted successfully"
}
```

---

## Complete Workflow Example

### Step 1: Create Tags First
```
POST /api/tags
{
  "name": "Mobile Legends",
  "status": "active"
}

POST /api/tags
{
  "name": "Pubg Mobile",
  "status": "active"
}
```

### Step 2: Create App Config with Images
```
POST /api/app-config
[form-data]
images: file1.jpg
images: file2.jpg
ad_text: "အကောင့်တွင်ငွေဖြည့်ပြီးအရောက်ပါက page တွင်ဆက်သွယ်ပြောဆိုပေးပါ"
```

### Step 3: Add Tags to Config
```
POST /api/app-config/tags
{
  "tags": "Mobile Legends"
}

POST /api/app-config/tags
{
  "tags": "Pubg Mobile"
}
```

### Step 4: Add More View Pager Images
```
POST /api/app-config/view-pager
[form-data]
image: banner3.jpg
```

---

## Error Responses

### Tag Not Found
```json
{
  "success": false,
  "message": "Tag 'Mobile Legends' does not exist or is inactive. Please create the tag first."
}
```

### Invalid Index
```json
{
  "success": false,
  "message": "Invalid index"
}
```

### Config Not Found
```json
{
  "success": false,
  "message": "Config not found"
}
```

---

## Postman Environment Variables

Create these variables in Postman:
```
base_url: http://localhost:3000
admin_token: YOUR_ACTUAL_ADMIN_TOKEN_HERE
```

Then use them in requests:
- URL: `{{base_url}}/api/app-config`
- Header: `Authorization: Bearer {{admin_token}}`
