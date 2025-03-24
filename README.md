# **API Documentation**

This API is built using Express and provides endpoints for web scraping, image classification, and file management. Below is the documentation for installation, setup, and usage.

---

## **Table of Contents**

1. [Installation](#installation)
2. [Environment Setup](#environment-setup)
3. [Running the Application](#running-the-application)
4. [API Endpoints](#api-endpoints)
   - [Extract Data](#extract-data)
   - [Extract Category](#extract-category)
   - [Extract Range](#extract-range)
   - [Classify Packaging](#classify-packaging)
   - [Save CSV](#save-csv)
   - [Save JSON](#save-json)
5. [Sample Requests and Responses](#sample-requests-and-responses)

---

## **Installation**

1. Clone the repository:

   ```bash
   git clone https://github.com/christo3jesus/reto-marzo-scraping.git
   cd reto-marzo-scraping
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## **Environment Setup**

1. Rename the `.env.sample` file to `.env`:

   ```bash
   cp .env.sample .env
   ```

2. Update the `.env` file with your environment variables:
   ```env
   PORT=3000
   ```

---

## **Running the Application**

- **Development Mode** (with hot-reload):

  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

---

## **API Endpoints**

### **Extract Data**

- **Endpoint**: `POST /api/extract-data`
- **Description**: Extracts product data from a specific page of the Tottus website.
- **Request Body**:
  ```json
  {
    "page": 1
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "products": [
      {
        "brand": "PRIMOR",
        "name": "Aceite Vegetal Premium 900 ml",
        "price": "S/ 11",
        "image": "https://example.com/image.jpg",
        "link": "https://example.com/product"
      }
    ]
  }
  ```

---

### **Extract Category**

- **Endpoint**: `POST /api/extract-category`
- **Description**: Extracts the category and subcategory of a product from its URL.
- **Request Body**:
  ```json
  {
    "productUrl": "https://tottus.falabella.com.pe/product-url"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "category": "Despensa",
    "subcategory": "Aceites"
  }
  ```

---

### **Extract Range**

- **Endpoint**: `POST /api/extract-range`
- **Description**: Extracts product data from a range of pages.
- **Request Body**:
  ```json
  {
    "startPage": 1,
    "endPage": 3
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "totalProducts": 60,
    "products": [
      {
        "brand": "PRIMOR",
        "name": "Aceite Vegetal Premium 900 ml",
        "price": "S/ 11",
        "image": "https://example.com/image.jpg",
        "link": "https://example.com/product"
      }
    ]
  }
  ```

---

### **Classify Packaging**

- **Endpoint**: `POST /api/classify-packaging`
- **Description**: Classifies an image of product packaging using Hugging Face's zero-shot image classification.
- **Request Body**:
  ```json
  {
    "apiKey": "your-hugging-face-api-key",
    "imageUrl": "https://example.com/image.jpg"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "result": [
      {
        "label": "rigid packaging",
        "score": 0.85
      },
      {
        "label": "flexible packaging",
        "score": 0.15
      }
    ]
  }
  ```

---

### **Save CSV**

- **Endpoint**: `POST /api/save-csv`
- **Description**: Saves product data to a CSV file.
- **Request Body**:
  ```json
  {
    "data": [
      {
        "name": "Aceite Vegetal",
        "price": "S/ 11"
      },
      {
        "name": "Arroz Extra",
        "price": "S/ 30"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "CSV saved successfully",
    "fileUrl": "/files/products_550e8400-e29b-41d4-a716-446655440000.csv"
  }
  ```

---

### **Save JSON**

- **Endpoint**: `POST /api/save-json`
- **Description**: Saves product data to a JSON file.
- **Request Body**:
  ```json
  {
    "data": [
      {
        "name": "Aceite Vegetal",
        "price": "S/ 11"
      },
      {
        "name": "Arroz Extra",
        "price": "S/ 30"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "JSON saved successfully",
    "fileUrl": "/files/products_550e8400-e29b-41d4-a716-446655440000.json"
  }
  ```

---

## **Sample Requests and Responses**

### **Sample Request for Extract Data**

```bash
curl -X POST http://localhost:3000/api/extract-data -H "Content-Type: application/json" -d '{
  "page": 1
}'
```

### **Sample Request for Extract Category**

```bash
curl -X POST http://localhost:3000/api/extract-category -H "Content-Type: application/json" -d '{
  "productUrl": "https://tottus.falabella.com.pe/product-url"
}'
```

### **Sample Request for Extract Range**

```bash
curl -X POST http://localhost:3000/api/extract-range -H "Content-Type: application/json" -d '{
  "startPage": 1,
  "endPage": 3
}'
```

### **Sample Request for Classify Packaging**

```bash
curl -X POST http://localhost:3000/api/classify-packaging -H "Content-Type: application/json" -d '{
  "apiKey": "your-hugging-face-api-key",
  "imageUrl": "https://example.com/image.jpg"
}'
```

### **Sample Request for Save CSV**

```bash
curl -X POST http://localhost:3000/api/save-csv -H "Content-Type: application/json" -d '{
  "data": [
    { "name": "Aceite Vegetal", "price": "S/ 11" },
    { "name": "Arroz Extra", "price": "S/ 30" }
  ]
}'
```

### **Sample Request for Save JSON**

```bash
curl -X POST http://localhost:3000/api/save-json -H "Content-Type: application/json" -d '{
  "data": [
    { "name": "Aceite Vegetal", "price": "S/ 11" },
    { "name": "Arroz Extra", "price": "S/ 30" }
  ]
}'
```

---

## **OpenAPI Specification**

The OpenAPI specification for this API is available at:

```
http://localhost:3000
```

You can access it through a browser or use tools like Swagger UI to explore the available endpoints interactively.

---

## **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
