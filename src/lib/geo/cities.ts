// Comprehensive Global City & Longitude Ephemeris for True Solar Time (真太陽時全球城市數據庫)
// Provides instant offline search, exact geographic longitudes, and GPS distance matching.

export interface MajorCity {
  id: string;
  nameEn: string;
  nameZh: string;
  regionEn: string;
  regionZh: string;
  countryEn: string;
  countryZh: string;
  longitude: number;
  latitude: number;
  timeZoneOffset: number; // in hours from UTC
}

export const MAJOR_CITIES: MajorCity[] = [
  // ─── TAIWAN (臺灣) ────────────────────────────────────────────────────────
  { id: 'tw-tpe', nameEn: 'Taipei', nameZh: '臺北 / 台北', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 121.5654, latitude: 25.033, timeZoneOffset: 8 },
  { id: 'tw-ntpc', nameEn: 'New Taipei', nameZh: '新北', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 121.4657, latitude: 25.012, timeZoneOffset: 8 },
  { id: 'tw-txg', nameEn: 'Taichung', nameZh: '臺中 / 台中', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 120.6736, latitude: 24.1477, timeZoneOffset: 8 },
  { id: 'tw-tnn', nameEn: 'Tainan', nameZh: '臺南 / 台南', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 120.1849, latitude: 22.9997, timeZoneOffset: 8 },
  { id: 'tw-khh', nameEn: 'Kaohsiung', nameZh: '高雄', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 120.3119, latitude: 22.6273, timeZoneOffset: 8 },
  { id: 'tw-tyc', nameEn: 'Taoyuan', nameZh: '桃園', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 121.301, latitude: 24.9936, timeZoneOffset: 8 },
  { id: 'tw-hsz', nameEn: 'Hsinchu', nameZh: '新竹', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 120.9688, latitude: 24.8039, timeZoneOffset: 8 },
  { id: 'tw-kel', nameEn: 'Keelung', nameZh: '基隆', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 121.7462, latitude: 25.1276, timeZoneOffset: 8 },
  { id: 'tw-cyi', nameEn: 'Chiayi', nameZh: '嘉義', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 120.4473, latitude: 23.4801, timeZoneOffset: 8 },
  { id: 'tw-hun', nameEn: 'Hualien', nameZh: '花蓮', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 121.6068, latitude: 23.9872, timeZoneOffset: 8 },
  { id: 'tw-ttt', nameEn: 'Taitung', nameZh: '臺東 / 台東', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 121.1444, latitude: 22.7583, timeZoneOffset: 8 },
  { id: 'tw-mzu', nameEn: 'Matsu Islands', nameZh: '馬祖 (連江)', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 119.9289, latitude: 26.1558, timeZoneOffset: 8 },
  { id: 'tw-knh', nameEn: 'Kinmen', nameZh: '金門', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 118.3226, latitude: 24.4327, timeZoneOffset: 8 },
  { id: 'tw-mzg', nameEn: 'Penghu', nameZh: '澎湖', regionEn: 'Taiwan', regionZh: '臺灣', countryEn: 'Taiwan', countryZh: '臺灣', longitude: 119.5793, latitude: 23.5711, timeZoneOffset: 8 },

  // ─── HONG KONG & MACAU ────────────────────────────────────────────────────
  { id: 'hk-hkg', nameEn: 'Hong Kong', nameZh: '香港', regionEn: 'Hong Kong', regionZh: '香港', countryEn: 'China', countryZh: '中國', longitude: 114.1694, latitude: 22.3193, timeZoneOffset: 8 },
  { id: 'mo-mfm', nameEn: 'Macau', nameZh: '澳門', regionEn: 'Macau', regionZh: '澳門', countryEn: 'China', countryZh: '中國', longitude: 113.5439, latitude: 22.1987, timeZoneOffset: 8 },

  // ─── MAINLAND CHINA (中國大陸主要城市) ────────────────────────────────────
  { id: 'cn-bjs', nameEn: 'Beijing', nameZh: '北京', regionEn: 'Beijing', regionZh: '北京', countryEn: 'China', countryZh: '中國', longitude: 116.4074, latitude: 39.9042, timeZoneOffset: 8 },
  { id: 'cn-sha', nameEn: 'Shanghai', nameZh: '上海', regionEn: 'Shanghai', regionZh: '上海', countryEn: 'China', countryZh: '中國', longitude: 121.4737, latitude: 31.2304, timeZoneOffset: 8 },
  { id: 'cn-can', nameEn: 'Guangzhou', nameZh: '廣州 / 广州', regionEn: 'Guangdong', regionZh: '廣東', countryEn: 'China', countryZh: '中國', longitude: 113.2644, latitude: 23.1291, timeZoneOffset: 8 },
  { id: 'cn-szx', nameEn: 'Shenzhen', nameZh: '深圳', regionEn: 'Guangdong', regionZh: '廣東', countryEn: 'China', countryZh: '中國', longitude: 114.0579, latitude: 22.5431, timeZoneOffset: 8 },
  { id: 'cn-ctu', nameEn: 'Chengdu', nameZh: '成都', regionEn: 'Sichuan', regionZh: '四川', countryEn: 'China', countryZh: '中國', longitude: 104.0668, latitude: 30.5728, timeZoneOffset: 8 },
  { id: 'cn-ckg', nameEn: 'Chongqing', nameZh: '重慶 / 重庆', regionEn: 'Chongqing', regionZh: '重慶', countryEn: 'China', countryZh: '中國', longitude: 106.5516, latitude: 29.563, timeZoneOffset: 8 },
  { id: 'cn-hgh', nameEn: 'Hangzhou', nameZh: '杭州', regionEn: 'Zhejiang', regionZh: '浙江', countryEn: 'China', countryZh: '中國', longitude: 120.1551, latitude: 30.2741, timeZoneOffset: 8 },
  { id: 'cn-wuh', nameEn: 'Wuhan', nameZh: '武漢 / 武汉', regionEn: 'Hubei', regionZh: '湖北', countryEn: 'China', countryZh: '中國', longitude: 114.3055, latitude: 30.5928, timeZoneOffset: 8 },
  { id: 'cn-nkg', nameEn: 'Nanjing', nameZh: '南京', regionEn: 'Jiangsu', regionZh: '江蘇', countryEn: 'China', countryZh: '中國', longitude: 118.7969, latitude: 32.0603, timeZoneOffset: 8 },
  { id: 'cn-sia', nameEn: "Xi'an", nameZh: '西安', regionEn: 'Shaanxi', regionZh: '陝西', countryEn: 'China', countryZh: '中國', longitude: 108.9398, latitude: 34.3416, timeZoneOffset: 8 },
  { id: 'cn-tsn', nameEn: 'Tianjin', nameZh: '天津', regionEn: 'Tianjin', regionZh: '天津', countryEn: 'China', countryZh: '中國', longitude: 117.201, latitude: 39.0842, timeZoneOffset: 8 },
  { id: 'cn-szv', nameEn: 'Suzhou', nameZh: '蘇州 / 苏州', regionEn: 'Jiangsu', regionZh: '江蘇', countryEn: 'China', countryZh: '中國', longitude: 120.5853, latitude: 31.299, timeZoneOffset: 8 },
  { id: 'cn-xmn', nameEn: 'Xiamen', nameZh: '廈門 / 厦门', regionEn: 'Fujian', regionZh: '福建', countryEn: 'China', countryZh: '中國', longitude: 118.0894, latitude: 24.4798, timeZoneOffset: 8 },
  { id: 'cn-foc', nameEn: 'Fuzhou', nameZh: '福州', regionEn: 'Fujian', regionZh: '福建', countryEn: 'China', countryZh: '中國', longitude: 119.3062, latitude: 26.0753, timeZoneOffset: 8 },
  { id: 'cn-cgo', nameEn: 'Zhengzhou', nameZh: '鄭州 / 郑州', regionEn: 'Henan', regionZh: '河南', countryEn: 'China', countryZh: '中國', longitude: 113.6254, latitude: 34.7466, timeZoneOffset: 8 },
  { id: 'cn-csx', nameEn: 'Changsha', nameZh: '長沙 / 长沙', regionEn: 'Hunan', regionZh: '湖南', countryEn: 'China', countryZh: '中國', longitude: 112.9388, latitude: 28.2282, timeZoneOffset: 8 },
  { id: 'cn-tao', nameEn: 'Qingdao', nameZh: '青島 / 青岛', regionEn: 'Shandong', regionZh: '山東', countryEn: 'China', countryZh: '中國', longitude: 120.3826, latitude: 36.0671, timeZoneOffset: 8 },
  { id: 'cn-she', nameEn: 'Shenyang', nameZh: '瀋陽 / 沈阳', regionEn: 'Liaoning', regionZh: '遼寧', countryEn: 'China', countryZh: '中國', longitude: 123.4315, latitude: 41.8057, timeZoneOffset: 8 },
  { id: 'cn-kmg', nameEn: 'Kunming', nameZh: '昆明', regionEn: 'Yunnan', regionZh: '雲南', countryEn: 'China', countryZh: '中國', longitude: 102.8329, latitude: 24.8801, timeZoneOffset: 8 },
  { id: 'cn-hak', nameEn: 'Haikou', nameZh: '海口', regionEn: 'Hainan', regionZh: '海南', countryEn: 'China', countryZh: '中國', longitude: 110.3312, latitude: 20.0319, timeZoneOffset: 8 },
  { id: 'cn-syx', nameEn: 'Sanya', nameZh: '三亞 / 三亚', regionEn: 'Hainan', regionZh: '海南', countryEn: 'China', countryZh: '中國', longitude: 109.5119, latitude: 18.2528, timeZoneOffset: 8 },
  { id: 'cn-urm', nameEn: 'Urumqi', nameZh: '烏魯木齊 / 乌鲁木齐', regionEn: 'Xinjiang', regionZh: '新疆', countryEn: 'China', countryZh: '中國', longitude: 87.6177, latitude: 43.7928, timeZoneOffset: 8 },
  { id: 'cn-lxa', nameEn: 'Lhasa', nameZh: '拉薩 / 拉萨', regionEn: 'Tibet', regionZh: '西藏', countryEn: 'China', countryZh: '中國', longitude: 91.1322, latitude: 29.6603, timeZoneOffset: 8 },

  // ─── EAST & SOUTHEAST ASIA ────────────────────────────────────────────────
  { id: 'jp-tyo', nameEn: 'Tokyo', nameZh: '東京', regionEn: 'Kanto', regionZh: '關東', countryEn: 'Japan', countryZh: '日本', longitude: 139.6917, latitude: 35.6895, timeZoneOffset: 9 },
  { id: 'jp-osa', nameEn: 'Osaka', nameZh: '大阪', regionEn: 'Kansai', regionZh: '關西', countryEn: 'Japan', countryZh: '日本', longitude: 135.5023, latitude: 34.6937, timeZoneOffset: 9 },
  { id: 'jp-kyo', nameEn: 'Kyoto', nameZh: '京都', regionEn: 'Kansai', regionZh: '關西', countryEn: 'Japan', countryZh: '日本', longitude: 135.7681, latitude: 35.0116, timeZoneOffset: 9 },
  { id: 'kr-sel', nameEn: 'Seoul', nameZh: '首爾 / 汉城', regionEn: 'Gyeonggi', regionZh: '京畿', countryEn: 'South Korea', countryZh: '韓國', longitude: 126.978, latitude: 37.5665, timeZoneOffset: 9 },
  { id: 'kr-pus', nameEn: 'Busan', nameZh: '釜山', regionEn: 'Gyeongsang', regionZh: '慶尚', countryEn: 'South Korea', countryZh: '韓國', longitude: 129.0756, latitude: 35.1796, timeZoneOffset: 9 },
  { id: 'sg-sin', nameEn: 'Singapore', nameZh: '新加坡', regionEn: 'Singapore', regionZh: '新加坡', countryEn: 'Singapore', countryZh: '新加坡', longitude: 103.8198, latitude: 1.3521, timeZoneOffset: 8 },
  { id: 'my-kul', nameEn: 'Kuala Lumpur', nameZh: '吉隆坡', regionEn: 'Federal Territory', regionZh: '聯邦直轄區', countryEn: 'Malaysia', countryZh: '馬來西亞', longitude: 101.6869, latitude: 3.139, timeZoneOffset: 8 },
  { id: 'my-pen', nameEn: 'Penang', nameZh: '檳城', regionEn: 'Penang', regionZh: '檳城', countryEn: 'Malaysia', countryZh: '馬來西亞', longitude: 100.3327, latitude: 5.4164, timeZoneOffset: 8 },
  { id: 'th-bkk', nameEn: 'Bangkok', nameZh: '曼谷', regionEn: 'Central', regionZh: '中部', countryEn: 'Thailand', countryZh: '泰國', longitude: 100.5018, latitude: 13.7563, timeZoneOffset: 7 },
  { id: 'th-cnx', nameEn: 'Chiang Mai', nameZh: '清邁', regionEn: 'Northern', regionZh: '北部', countryEn: 'Thailand', countryZh: '泰國', longitude: 98.9853, latitude: 18.7883, timeZoneOffset: 7 },
  { id: 'ph-mnl', nameEn: 'Manila', nameZh: '馬尼拉', regionEn: 'Luzon', regionZh: '呂宋', countryEn: 'Philippines', countryZh: '菲律賓', longitude: 120.9842, latitude: 14.5995, timeZoneOffset: 8 },
  { id: 'vn-sgn', nameEn: 'Ho Chi Minh City', nameZh: '胡志明市', regionEn: 'Southern', regionZh: '南部', countryEn: 'Vietnam', countryZh: '越南', longitude: 106.6297, latitude: 10.8231, timeZoneOffset: 7 },
  { id: 'vn-han', nameEn: 'Hanoi', nameZh: '河內', regionEn: 'Northern', regionZh: '北部', countryEn: 'Vietnam', countryZh: '越南', longitude: 105.8342, latitude: 21.0278, timeZoneOffset: 7 },
  { id: 'id-jkt', nameEn: 'Jakarta', nameZh: '雅加達', regionEn: 'Java', regionZh: '爪哇', countryEn: 'Indonesia', countryZh: '印尼', longitude: 106.8456, latitude: -6.2088, timeZoneOffset: 7 },

  // ─── NORTH AMERICA (北美洲) ────────────────────────────────────────────────
  { id: 'us-nyc', nameEn: 'New York', nameZh: '紐約 / 纽约', regionEn: 'NY', regionZh: '紐約州', countryEn: 'United States', countryZh: '美國', longitude: -74.006, latitude: 40.7128, timeZoneOffset: -5 },
  { id: 'us-lax', nameEn: 'Los Angeles', nameZh: '洛杉磯 / 洛杉矶', regionEn: 'CA', regionZh: '加州', countryEn: 'United States', countryZh: '美國', longitude: -118.2437, latitude: 34.0522, timeZoneOffset: -8 },
  { id: 'us-sfo', nameEn: 'San Francisco', nameZh: '舊金山 / 三藩市', regionEn: 'CA', regionZh: '加州', countryEn: 'United States', countryZh: '美國', longitude: -122.4194, latitude: 37.7749, timeZoneOffset: -8 },
  { id: 'us-sjc', nameEn: 'San Jose / Silicon Valley', nameZh: '聖荷西 / 矽谷', regionEn: 'CA', regionZh: '加州', countryEn: 'United States', countryZh: '美國', longitude: -121.8863, latitude: 37.3382, timeZoneOffset: -8 },
  { id: 'us-sea', nameEn: 'Seattle', nameZh: '西雅圖 / 西雅图', regionEn: 'WA', regionZh: '華盛頓州', countryEn: 'United States', countryZh: '美國', longitude: -122.3321, latitude: 47.6062, timeZoneOffset: -8 },
  { id: 'us-chi', nameEn: 'Chicago', nameZh: '芝加哥', regionEn: 'IL', regionZh: '伊利諾州', countryEn: 'United States', countryZh: '美國', longitude: -87.6298, latitude: 41.8781, timeZoneOffset: -6 },
  { id: 'us-bos', nameEn: 'Boston', nameZh: '波士頓', regionEn: 'MA', regionZh: '麻省', countryEn: 'United States', countryZh: '美國', longitude: -71.0589, latitude: 42.3601, timeZoneOffset: -5 },
  { id: 'us-hou', nameEn: 'Houston', nameZh: '休士頓', regionEn: 'TX', regionZh: '德州', countryEn: 'United States', countryZh: '美國', longitude: -95.3698, latitude: 29.7604, timeZoneOffset: -6 },
  { id: 'us-dfw', nameEn: 'Dallas', nameZh: '達拉斯', regionEn: 'TX', regionZh: '德州', countryEn: 'United States', countryZh: '美國', longitude: -96.797, latitude: 32.7767, timeZoneOffset: -6 },
  { id: 'us-aus', nameEn: 'Austin', nameZh: '奧斯汀', regionEn: 'TX', regionZh: '德州', countryEn: 'United States', countryZh: '美國', longitude: -97.7431, latitude: 30.2672, timeZoneOffset: -6 },
  { id: 'us-mia', nameEn: 'Miami', nameZh: '邁阿密', regionEn: 'FL', regionZh: '佛羅里達州', countryEn: 'United States', countryZh: '美國', longitude: -80.1918, latitude: 25.7617, timeZoneOffset: -5 },
  { id: 'us-was', nameEn: 'Washington D.C.', nameZh: '華盛頓特區', regionEn: 'DC', regionZh: '特區', countryEn: 'United States', countryZh: '美國', longitude: -77.0369, latitude: 38.9072, timeZoneOffset: -5 },
  { id: 'us-hnl', nameEn: 'Honolulu', nameZh: '檀香山 / 檀島', regionEn: 'HI', regionZh: '夏威夷', countryEn: 'United States', countryZh: '美國', longitude: -157.8583, latitude: 21.3069, timeZoneOffset: -10 },
  { id: 'ca-yto', nameEn: 'Toronto', nameZh: '多倫多', regionEn: 'ON', regionZh: '安大略省', countryEn: 'Canada', countryZh: '加拿大', longitude: -79.3832, latitude: 43.6532, timeZoneOffset: -5 },
  { id: 'ca-yvr', nameEn: 'Vancouver', nameZh: '溫哥華 / 温哥华', regionEn: 'BC', regionZh: '卑詩省', countryEn: 'Canada', countryZh: '加拿大', longitude: -123.1207, latitude: 49.2827, timeZoneOffset: -8 },
  { id: 'ca-yul', nameEn: 'Montreal', nameZh: '蒙特婁 / 满地可', regionEn: 'QC', regionZh: '魁北克省', countryEn: 'Canada', countryZh: '加拿大', longitude: -73.5673, latitude: 45.5017, timeZoneOffset: -5 },

  // ─── EUROPE (歐洲) ────────────────────────────────────────────────────────
  { id: 'uk-lon', nameEn: 'London', nameZh: '倫敦', regionEn: 'England', regionZh: '英格蘭', countryEn: 'United Kingdom', countryZh: '英國', longitude: -0.1278, latitude: 51.5074, timeZoneOffset: 0 },
  { id: 'fr-par', nameEn: 'Paris', nameZh: '巴黎', regionEn: 'Île-de-France', regionZh: '法蘭西島', countryEn: 'France', countryZh: '法國', longitude: 2.3522, latitude: 48.8566, timeZoneOffset: 1 },
  { id: 'de-ber', nameEn: 'Berlin', nameZh: '柏林', regionEn: 'Berlin', regionZh: '柏林', countryEn: 'Germany', countryZh: '德國', longitude: 13.405, latitude: 52.52, timeZoneOffset: 1 },
  { id: 'de-fra', nameEn: 'Frankfurt', nameZh: '法蘭克福', regionEn: 'Hesse', regionZh: '黑森', countryEn: 'Germany', countryZh: '德國', longitude: 8.6821, latitude: 50.1109, timeZoneOffset: 1 },
  { id: 'nl-ams', nameEn: 'Amsterdam', nameZh: '阿姆斯特丹', regionEn: 'North Holland', regionZh: '北荷蘭', countryEn: 'Netherlands', countryZh: '荷蘭', longitude: 4.9041, latitude: 52.3676, timeZoneOffset: 1 },
  { id: 'ch-zrh', nameEn: 'Zurich', nameZh: '蘇黎世', regionEn: 'Zurich', regionZh: '蘇黎世', countryEn: 'Switzerland', countryZh: '瑞士', longitude: 8.5417, latitude: 47.3769, timeZoneOffset: 1 },
  { id: 'it-rom', nameEn: 'Rome', nameZh: '羅馬', regionEn: 'Lazio', regionZh: '拉齊奧', countryEn: 'Italy', countryZh: '義大利', longitude: 12.4964, latitude: 41.9028, timeZoneOffset: 1 },
  { id: 'es-mad', nameEn: 'Madrid', nameZh: '馬德里', regionEn: 'Madrid', regionZh: '馬德里', countryEn: 'Spain', countryZh: '西班牙', longitude: -3.7038, latitude: 40.4168, timeZoneOffset: 1 },

  // ─── OCEANIA (大洋洲) ─────────────────────────────────────────────────────
  { id: 'au-syd', nameEn: 'Sydney', nameZh: '雪梨 / 悉尼', regionEn: 'NSW', regionZh: '新南威爾斯', countryEn: 'Australia', countryZh: '澳洲', longitude: 151.2093, latitude: -33.8688, timeZoneOffset: 10 },
  { id: 'au-mel', nameEn: 'Melbourne', nameZh: '墨爾本', regionEn: 'VIC', regionZh: '維多利亞', countryEn: 'Australia', countryZh: '澳洲', longitude: 144.9631, latitude: -37.8136, timeZoneOffset: 10 },
  { id: 'au-bne', nameEn: 'Brisbane', nameZh: '布里斯本', regionEn: 'QLD', regionZh: '昆士蘭', countryEn: 'Australia', countryZh: '澳洲', longitude: 153.0251, latitude: -27.4698, timeZoneOffset: 10 },
  { id: 'nz-akl', nameEn: 'Auckland', nameZh: '奧克蘭', regionEn: 'Auckland', regionZh: '奧克蘭', countryEn: 'New Zealand', countryZh: '紐西蘭', longitude: 174.7633, latitude: -36.8485, timeZoneOffset: 12 },
];

/**
 * Searches cities by English or Chinese query.
 */
export function searchCities(query: string, limit = 8): MajorCity[] {
  if (!query || query.trim().length === 0) {
    // Return top popular Asian & global hubs by default
    return MAJOR_CITIES.slice(0, limit);
  }

  const q = query.toLowerCase().trim();
  const matched = MAJOR_CITIES.filter((c) => {
    return (
      c.nameEn.toLowerCase().includes(q) ||
      c.nameZh.toLowerCase().includes(q) ||
      c.regionEn.toLowerCase().includes(q) ||
      c.regionZh.toLowerCase().includes(q) ||
      c.countryEn.toLowerCase().includes(q) ||
      c.countryZh.toLowerCase().includes(q)
    );
  });

  return matched.slice(0, limit);
}

/**
 * Calculates Euclidean distance approximation between coordinates to find nearest city.
 */
export function findNearestCity(lat: number, lon: number): MajorCity {
  let nearest = MAJOR_CITIES[0];
  let minDistanceSq = Number.MAX_VALUE;

  for (const city of MAJOR_CITIES) {
    const dLat = city.latitude - lat;
    const dLon = city.longitude - lon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      nearest = city;
    }
  }

  return nearest;
}

/**
 * Helper to format longitude into standard East/West degrees representation.
 */
export function formatLongitude(lon: number): string {
  const dir = lon >= 0 ? '°E' : '°W';
  return `${Math.abs(lon).toFixed(2)}${dir}`;
}
