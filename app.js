// ตั้งค่า Supabase Credentials
const SUPABASE_URL = "https://gujusmzpdqasvkaozpou.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anVzbXpwZHFhc3ZrYW96cG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MjU5MTMsImV4cCI6MjEwOTAwMTkxM30.Jgu5Uba4CuA5HEqSyRwBizNcsamG5GESI5K0tLQFKQE";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// แสดงการแจ้งเตือนแบบ Toast (แทน alert)
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// อัปเดต IP กล้อง
function updateCameraIP() {
    const ip = document.getElementById('cam-ip').value;
    if(ip) {
        document.getElementById('camera-stream').src = `http://${ip}:81/stream`;
        showToast("เชื่อมต่อ IP กล้องสำเร็จ");
    }
}

// ส่งคำสั่งไปยังตาราง commands บน Supabase
async function sendCommand(type) {
    let typeName = "";
    if (type === 'FOOD') typeName = "จ่ายอาหาร";
    else if (type === 'WATER') typeName = "เติมน้ำ";
    else if (type === 'FAN_ON') typeName = "เปิดพัดลม";
    else if (type === 'FAN_OFF') typeName = "ปิดพัดลม";
    else if (type === 'FAN_AUTO') typeName = "ตั้งพัดลมอัตโนมัติ";
    else if (type === 'TARE_FOOD') typeName = "เซ็ตศูนย์ถาดอาหาร";
    else if (type === 'TARE_WATER') typeName = "เซ็ตศูนย์ถาดน้ำ";

    showToast(`ส่งคำสั่ง: ${typeName} เรียบร้อยแล้ว`);

    const { error } = await _supabase
        .from('commands')
        .insert([{ command_type: type, status: 'PENDING' }]);

    if (error) {
        showToast("เกิดข้อผิดพลาด: " + error.message);
    }
}

// ดึงข้อมูลเซนเซอร์ล่าสุด
async function fetchLatestSensorData() {
    const { data, error } = await _supabase
        .from('sensor_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);

    if (error || !data || data.length === 0) return;

    const latest = data[0];
    document.getElementById('food-val').innerText = `${latest.food_weight.toFixed(1)} g`;
    document.getElementById('water-val').innerText = `${latest.water_weight.toFixed(1)} ml`;
    document.getElementById('temp-val').innerText = `${latest.temperature.toFixed(1)} °C`;
    document.getElementById('hum-val').innerText = `${latest.humidity.toFixed(1)} %`;

    // อัปเดต สถานะ Online
    const statusPill = document.getElementById('system-status');
    statusPill.classList.add('online');
    document.getElementById('status-text').innerText = "Online";

    // อัปเดต ตารางประวัติ
    const tbody = document.getElementById('log-table-body');
    tbody.innerHTML = data.map(row => `
        <tr>
            <td>${new Date(row.created_at).toLocaleTimeString('th-TH')}</td>
            <td>${row.food_weight.toFixed(1)}</td>
            <td>${row.water_weight.toFixed(1)}</td>
            <td>${row.temperature.toFixed(1)}</td>
            <td>${row.humidity.toFixed(1)}</td>
        </tr>
    `).join('');
}

// ดึงข้อมูลทุกๆ 3 วินาที
setInterval(fetchLatestSensorData, 3000);
fetchLatestSensorData();
updateCameraIP();