"use strict";

const axios = require("axios");

async function finalTest() {
  console.log("🚀 BACKEND FİNAL TEST - API Endpoints");
  console.log("=" .repeat(50));
  
  const BASE_URL = "http://localhost:5000/api";
  let results = [];
  
  // Test 1: Health Check
  try {
    const healthResponse = await axios.get("http://localhost:5000/api/health");
    if (healthResponse.status === 200) {
      results.push("✅ Health Check: Başarılı");
    }
  } catch (error) {
    results.push("❌ Health Check: " + error.message);
  }
  
  // Test 2: Register
  const testUser = {
    name: "Final Test User",
    email: `finaltest_${Date.now()}@example.com`,
    password: "test123456"
  };
  
  let authToken = "";
  
  try {
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    if (registerResponse.status === 201 && registerResponse.data.token) {
      authToken = registerResponse.data.token;
      results.push("✅ User Register: Başarılı + JWT Token alındı");
    }
  } catch (error) {
    results.push("❌ User Register: " + (error.response?.data?.message || error.message));
  }
  
  // Test 3: Login
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    if (loginResponse.status === 200 && loginResponse.data.token) {
      results.push("✅ User Login: Başarılı");
    }
  } catch (error) {
    results.push("❌ User Login: " + (error.response?.data?.message || error.message));
  }
  
  // Test 4: Add Product (with current price)
  let productId = null;
  if (authToken) {
    try {
      const productData = {
        name: "Final Test - Logitech Mouse",
        targetPrice: 500,
        url: "https://www.hepsiburada.com/logitech-g213-prodigy-rgb-turkce-gaming-klavye-920-008094-p-HBV00000247UE"
      };
      
      const addResponse = await axios.post(`${BASE_URL}/product/add`, productData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (addResponse.status === 201) {
        productId = addResponse.data.product.id;
        results.push(`✅ Add Product: Başarılı (ID: ${productId})`);
        
        if (addResponse.data.product.currentPrice) {
          results.push(`✅ Current Price Fetch: ${addResponse.data.product.currentPrice} TL`);
        }
      }
    } catch (error) {
      results.push("❌ Add Product: " + (error.response?.data?.message || error.message));
    }
  }
  
  // Test 5: List Products
  if (authToken) {
    try {
      const listResponse = await axios.get(`${BASE_URL}/product/list`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (listResponse.status === 200) {
        results.push(`✅ List Products: ${listResponse.data.length} ürün listelendi`);
      }
    } catch (error) {
      results.push("❌ List Products: " + (error.response?.data?.message || error.message));
    }
  }
  
  // Sonuçları göster
  console.log("\n📊 TEST SONUÇLARI:");
  results.forEach(result => console.log("   " + result));
  
  const successCount = results.filter(r => r.startsWith("✅")).length;
  const totalTests = results.length;
  
  console.log(`\n🎯 BAŞARI ORANI: ${successCount}/${totalTests} (%${Math.round(successCount/totalTests*100)})`);
  
  if (successCount === totalTests) {
    console.log("🎉 TÜM TESTLER BAŞARILI! Backend %100 hazır!");
  } else {
    console.log("⚠️ Bazı testlerde sorun var.");
  }
}

finalTest().catch(console.error);
