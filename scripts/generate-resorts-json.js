
import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES Modules에서 __dirname과 유사한 기능 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gemini API 클라이언트 초기화
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 사용자가 제공한 리조트 목록
const resortNames = [
  "Adaaran Club Rannalhi", "Adaaran Prestige Vadoo", "Adaaran Select Hudhuranfushi", "Adaaran Select Meedhupparu", 
  "Alila Kothaifaru Maldives", "Alimatha Aquatic Resort", "Anantara Kihavah Villas", "Anantara Veli and Naladhu", 
  "Angaga Island Resort and Spa", "Angsana Resort & Spa Maldives - Velavaru", "Atmosphere Kanifushi Maldives", 
  "Avani+ Fares Maldives Resort", "Ayada Maldives", "Baglioni Resort Maldives", "Bandos Maldives", 
  "Banyan Tree Maldives Vabbinfaru", "Barceló Whale Lagoon Maldives", "Baros Maldives", "OZEN RESERVE BOLIFUSHI", 
  "Brennia Kottefaru", "Centara Ras Fushi Resort & Spa", "Cheval Blanc Randheli", "Cinnamon Dhonveli Maldives", 
  "Cinnamon Hakuraa Huraa Maldives", "Cinnamon Velifushi Maldives", "Club Med Finolhu Villas", "Club Med Kanifinolhu", 
  "Coco Bodu Hithi", "Coco Palm Dhuni Kolhu", "Cocoa Island by COMO", "Cocogiri Island Resort", "Cocoon Maldives", 
  "Como Maalifushi", "Conrad Maldives Rangali Island", "Constance Halaveli Resort", "Constance Moofushi Resort", 
  "Cora Cora Maldives", "Dhawa Ihuru", "Dhigali Maldives", "Dhigufaru Island Resort", "Diamonds Athuruga", 
  "Diamonds Thudufushi", "Dreamland - The Unique Sea & Lake Resort/Spa", "Drift Theluveliga Retreat", 
  "Dusit Thani Maldives", "Ellaidhoo Maldives By Cinnamon", "Embudu Village", "Emerald Faarufushi Resort & Spa", 
  "Emerald Maldives Resort & Spa", "Eriyadu Island Resort", "Fihalhohi Island Resort", "Filitheyo Island Resort", 
  "Finolhu Baa Atoll Maldives", "Four Seasons Private Island Maldives at Voavah", "Four Seasons Resort Maldives at Kuda Huraa", 
  "Four Seasons Resort Maldives at Landaa Giraavaru", "Furaveri Maldives", "Fushifaru Maldives", 
  "Gangehi Island Resort", "Gili Lankanfushi", "Grand Park Kodhipparu Maldives", "Hard Rock Hotel Maldives", 
  "Heritance Aarah", "Hilton Maldives Amingiri Resort & Spa", "Holiday Inn Resort Kandooma Maldives", 
  "Hondaafushi Island Resort", "Hurawalhi Island Resort", "Huvafen Fushi Maldives", "InterContinental Maldives Maamunagau", 
  "JA Manafaru", "Joali Being Bodufushi", "Joali Muravandhoo", "Joy Island", "Jumeirah Maldives Olhahali Island", 
  "JW Marriott Maldives Resort & Spa", "Kagi Maldives Resort and Spa", "Kandima Maldives", "Kandolhu Maldives", 
  "Komandoo Island Resort", "Kuda Villingili Resort Maldives", "Kudadoo Maldives Private Island", "Kudafushi Resort & Spa", 
  "Kuramathi Maldives", "Mövenpick Resort Kuredhivaru Maldives", "Kuredu Island Resort & Spa",
  "Kurumba Maldives", "Le Méridien Maldives Resort & Spa", "Lily Beach Resort & Spa", "LUX* South Ari Atoll", "Maayafushi"
];


// 헬퍼 함수: 배열을 작은 크기의 청크로 나누기
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// 헬퍼 함수: 지연 시간 생성
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function generateResortsData() {
  console.log('Gemini API를 사용하여 대규모 리조트 데이터 생성을 시작합니다...');

  const model = 'gemini-2.5-pro';
  const allResortsData = [];
  const resortChunks = chunkArray(resortNames, 5); // 5개씩 나누어 처리
  let totalFetched = 0;

  for (let i = 0; i < resortChunks.length; i++) {
    const chunk = resortChunks[i];
    console.log(`\n[${i + 1}/${resortChunks.length}] 다음 리조트 그룹 처리 중: ${chunk.join(', ')}`);

    const prompt = `
      당신은 몰디브 여행 전문가입니다. Google 검색을 활용하여 다음 리조트 목록에 대한 최신 정보를 찾아주세요.
      리조트 목록:
      - ${chunk.join('\n- ')}

      결과는 반드시 아래의 JSON 형식과 동일한 구조를 가진 JSON 배열로만 응답해야 합니다. 목록에 없는 리조트는 응답에 포함하지 마세요.
      다른 설명이나 코멘트는 절대 추가하지 마세요.

      *   **transportation**: '수상비행기', '보트', '국내선' 중 하나여야 합니다.
      *   **price**: 4박, 성인 2인, 올인클루시브 기준의 대략적인 USD 가격입니다.
      *   **snorkelingQuality**: 1에서 5 사이의 점수로 평가해주세요.
      *   **imageUrl**: 매우 중요합니다. 각 리조트의 실제 모습을 보여주는 고품질 이미지의 직접 URL을 찾아주세요. (예: .jpg, .png, .webp). 공식 웹사이트, Booking.com, Expedia 같은 신뢰도 높은 소스를 우선으로 사용하세요. 절대 'picsum.photos'나 'unsplash' 같은 더미/스톡 이미지 사이트를 사용하지 마세요.
      *   **roomTypes**: 대표적인 룸 타입 2-3개를 배열 형태로 포함해주세요. (예: ["비치빌라", "워터빌라"])
      *   다른 모든 필드도 최대한 정확한 정보로 채워주세요.
      *   만약 특정 리조트 정보를 찾을 수 없다면, 결과에서 제외하세요.

      JSON 형식 예시:
      [{
        "id": 1, // id는 순차적으로 증가하도록 부여
        "name": "리조트 한글 이름",
        "name_en": "Resort English Name",
        "brand": "Brand Name",
        "openYear": 2020,
        "renovationYear": 2023,
        "transportation": "수상비행기",
        "travelTime": 35,
        "travelCost": 800,
        "price": 12000,
        "rating": 4.9,
        "snorkelingQuality": 5,
        "location": "Baa Atoll",
        "spaBrand": "Spa Brand Name",
        "restaurants": 4,
        "bars": 3,
        "pools": 2,
        "hasWaterVilla": true,
        "hasBeachVilla": true,
        "hasPrivatePool": true,
        "hasFamilyRoom": true,
        "hasKidsClub": true,
        "honeymoonPerks": true,
        "imageUrl": "https://www.fourseasons.com/alt/img-opt/~70.1530.0,0000-151,3302-3000,0000-1687,5000/publish/content/dam/fourseasons/images/web/MAL/MAL_106_1280x720.jpg",
        "roomTypes": ["비치빌라", "워터빌라"]
      }]
    `;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      console.log(`Gemini API로부터 응답을 받았습니다.`);
      
      let jsonString = response.text;
      
      // JSON 파싱을 시도하고, 실패할 경우를 대비해 try-catch로 감쌉니다.
      try {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const resortsFromChunk = JSON.parse(jsonString);

        if (Array.isArray(resortsFromChunk)) {
          // ID를 전체 목록 기준으로 순차적으로 다시 부여
          const processedResorts = resortsFromChunk.map((resort, index) => ({
            ...resort,
            id: totalFetched + index + 1,
          }));
          allResortsData.push(...processedResorts);
          totalFetched += processedResorts.length;
          console.log(`성공: ${processedResorts.length}개의 리조트 데이터를 추가했습니다. 총 ${totalFetched}개.`);
        } else {
          console.warn('경고: AI가 유효한 배열을 생성하지 않았습니다. 이 그룹은 건너뜁니다.');
        }
      } catch (parseError) {
        console.error(`JSON 파싱 오류 발생: ${parseError.message}`);
        console.error('API 원본 응답:', jsonString); // 디버깅을 위해 원본 응답을 출력
      }
      
      // API 속도 제한을 피하기 위해 요청 사이에 딜레이 추가
      if (i < resortChunks.length - 1) {
        await delay(2000); // 2초 대기
      }

    } catch (error) {
      console.error(`"${chunk.join(', ')}" 그룹 처리 중 API 오류 발생:`, error);
    }
  }

  if (allResortsData.length > 0) {
    const filePath = path.join(__dirname, '..', 'public', 'api', 'resorts.json');
    fs.writeFileSync(filePath, JSON.stringify(allResortsData, null, 2), 'utf-8');
    console.log(`\n\n최종 완료! 총 ${allResortsData.length}개의 리조트 데이터가 ${filePath}에 저장되었습니다.`);
  } else {
    console.error('\n\n오류: 최종적으로 생성된 리조트 데이터가 없습니다. 스크립트를 다시 실행해보세요.');
  }
}

// 이 스크립트를 실행하려면 터미널에서 'npm run generate-data'를 입력하세요.
// 먼저 API_KEY를 환경 변수로 설정해야 합니다.
// 예: export API_KEY="YOUR_GEMINI_API_KEY"
generateResortsData();
