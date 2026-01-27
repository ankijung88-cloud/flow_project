import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정: 데이터가 들어있는 폴더와 결과 파일명
const INPUT_DIR = path.join(__dirname, 'raw_data');
const OUTPUT_FILE = path.join(__dirname, 'combined_smoking_areas.xlsx');

// 표준화할 컬럼 매핑 (다양한 헤더 이름을 통일)
const COLUMN_MAPPING = {
    name: ['흡연구역명', '시설명', '장소명', '건물명', '설치위치', '위치'],
    address: ['소재지도로명주소', '도로명주소', '주소', '소재지', '설치주소'],
    lat: ['위도', 'latitude', 'lat', 'y'],
    lng: ['경도', 'longitude', 'lon', 'lng', 'x'],
    type: ['흡연구역구분', '시설구분', '설치유형', '구분', '유형'],
    agency: ['관리기관명', '관할구역', '데이터기준일자', '제공상태']
};

// 폴더가 없으면 생성
if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR);
    console.log(`📁 '${INPUT_DIR}' 폴더를 생성했습니다. 여기에 다운로드한 엑셀/CSV 파일들을 넣어주세요.`);
    process.exit(0);
}

const files = fs.readdirSync(INPUT_DIR);
let allData = [];

console.log(`🚀 데이터 병합을 시작합니다... (발견된 파일: ${files.length}개)`);

files.forEach(file => {
    if (file.startsWith('.') || (!file.endsWith('.csv') && !file.endsWith('.xlsx') && !file.endsWith('.xls'))) return;

    const filePath = path.join(INPUT_DIR, file);
    console.log(`📖 읽는 중: ${file}`);

    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // 데이터 정규화 및 병합
        const normalizedData = jsonData.map(row => {
            const newItem = {
                source_file: file, // 데이터 출처 추적용
                id: Math.random().toString(36).substr(2, 9),
            };

            // 컬럼 매핑 로직
            Object.keys(COLUMN_MAPPING).forEach(stdKey => {
                const candidates = COLUMN_MAPPING[stdKey];
                let foundValue = null;

                // row의 키들을 순회하며 매핑 후보와 일치하는지 확인
                Object.keys(row).forEach(rowKey => {
                    // 특수문자 제거 및 공백 제거 후 비교
                    const cleanRowKey = rowKey.replace(/\s+/g, '').replace(/[\(\)\[\]]/g, '');

                    if (candidates.some(c => cleanRowKey.includes(c) || c === cleanRowKey)) {
                        if (row[rowKey]) foundValue = row[rowKey];
                    }
                });

                newItem[stdKey] = foundValue || '';
            });

            // 필수 데이터(좌표)가 없으면 제외할지 여부 결정 (일단은 포함하고 마킹)
            if (!newItem.lat || !newItem.lng) {
                newItem.status = 'MISSING_COORDS';
            } else {
                newItem.status = 'OK';
            }

            return newItem;
        });

        allData = [...allData, ...normalizedData];
        console.log(`   ✅ ${normalizedData.length}개 데이터 로드 완료`);

    } catch (error) {
        console.error(`   ❌ 실패 (${file}):`, error.message);
    }
});

// 결과 저장
if (allData.length > 0) {
    const newWorkbook = XLSX.utils.book_new();
    const newSheet = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, "All_Smoking_Areas");
    XLSX.writeFile(newWorkbook, OUTPUT_FILE);

    console.log(`\n🎉 병합 완료! 총 ${allData.length}개의 흡연구역 데이터를 합쳤습니다.`);
    console.log(`💾 저장된 파일: ${OUTPUT_FILE}`);
} else {
    console.log('\n⚠️ 병합할 데이터가 없습니다. raw_data 폴더에 파일을 넣었는지 확인해주세요.');
}
