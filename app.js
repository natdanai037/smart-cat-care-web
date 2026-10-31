const SUPABASE_URL = "https://gujusmzpdqasvkaozpou.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkXVCJ9..."; // Key ของคุณ

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

function updateCameraIP() {
    const ip = document.getElementById('cam-ip').value;
    if(ip) {
        document.getElementById('camera-stream').src = `http://${ip}:81/stream`;
        showToast("เชื่อมต่อ IP กล้องสำเร็จ");
    }
}

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

    await _supabase
        .from('commands')
        .insert([{ command_type: type, status: 'PENDING' }]);
}

// ⚡ 1. ดึงสถานะสด (Real-time ทุก 2 วินาที) จากตาราง live_status
async function fetchLiveStatus() {
    const { data, error } = await _supabase
        .from('live_status')
        .select('*')
        .eq('id', 1)
        .single();

    if (error || !data) return;

    document.getElementById('food-val').innerText = `${data.food_weight.toFixed(1)} g`;
    document.getElementById('water-val').innerText = `${data.water_weight.toFixed(1)} ml`;
    document.getElementById('temp-val').innerText = `${data.temperature.toFixed(1)} °C`;
    document.getElementById('hum-val').innerText = `${data.humidity.toFixed(1)} %`;

    const statusPill = document.getElementById('system-status');
    statusPill.classList.add('online');
    document.getElementById('status-text').innerText = "Online";
}

// 📜 2. ดึงตารางประวัติ (ทุก 10 วินาที) จากตาราง sensor_logs
async function fetchSensorLogs() {
    const { data, error } = await _supabase
        .from('sensor_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);

    if (error || !data) return;

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

// ตั้งเวลาการดึงข้อมูล
setInterval(fetchLiveStatus, 2000);   // สถานะสดบนการ์ด = อัปเดตทุก 2 วินาที
setInterval(fetchSensorLogs, 10000);  // ตารางประวัติด้านล่าง = อัปเดตทุก 10 วินาที

fetchLiveStatus();
fetchSensorLogs();
updateCameraIP();