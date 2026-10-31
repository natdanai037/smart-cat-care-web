// ตั้งค่าคีย์เชื่อมต่อ Supabase
const SUPABASE_URL = "https://gujusmzpdqasvkaozpou.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anVzbXpwZHFhc3ZrYW96cG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MjU5MTMsImV4cCI6MjEwOTAwMTkxM30.Jgu5Uba4CuA5HEqSyRwBizNcsamG5GESI5K0tLQFKQE";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// เปลี่ยน IP ESP32-CAM
function updateCameraIP() {
    const ip = document.getElementById('cam-ip').value;
    if(ip) {
        document.getElementById('camera-stream').src = `http://${ip}:81/stream`;
    }
}

// สั่งงานจ่ายอาหาร/น้ำ (Insert Record ลงตาราง commands)
async function sendCommand(type) {
    const btn = type === 'FOOD' ? document.getElementById('btn-food') : document.getElementById('btn-water');
    btn.disabled = true;
    btn.innerText = "กำลังส่งคำสั่ง...";

    const { data, error } = await _supabase
        .from('commands')
        .insert([{ command_type: type, status: 'PENDING' }]);

    if (error) {
        alert("เกิดข้อผิดพลาดในการส่งคำสั่ง: " + error.message);
    } else {
        alert(`ส่งคำสั่งจ่าย ${type === 'FOOD' ? 'อาหาร' : 'น้ำ'} เรียบร้อย!`);
    }

    setTimeout(() => {
        btn.disabled = false;
        btn.innerText = type === 'FOOD' ? "🍖 สั่งจ่ายอาหาร" : "💧 สั่งจ่ายน้ำ";
    }, 2000);
}

// ดึงข้อมูลเซนเซอร์ล่าสุดมาแสดงผล
async function fetchLatestSensorData() {
    const { data, error } = await _supabase
        .from('sensor_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);

    if (error || !data || data.length === 0) return;

    // อัปเดตการ์ดสถานะล่าสุด
    const latest = data[0];
    document.getElementById('food-val').innerText = `${latest.food_weight.toFixed(1)} g`;
    document.getElementById('water-val').innerText = `${latest.water_weight.toFixed(1)} ml`;
    document.getElementById('temp-val').innerText = `${latest.temperature.toFixed(1)} °C`;
    document.getElementById('hum-val').innerText = `${latest.humidity.toFixed(1)} %RH`;
    
    document.getElementById('system-status').innerText = "System: Online";
    document.getElementById('system-status').style.background = "#2ecc71";

    // อัปเดตตารางประวัติ
    const tbody = document.getElementById('log-table-body');
    tbody.innerHTML = data.map(row => `
        <tr>
            <td>${new Date(row.created_at).toLocaleTimeString('th-TH')}</td>
            <td>${row.food_weight.toFixed(1)}</td>
            <td>${row.water_weight.toFixed(1)}</td>
            <td>${row.temperature.toFixed(1)}</td>
        </tr>
    `).join('');
}

// เรียกดึงข้อมูลทุกๆ 3 วินาที
setInterval(fetchLatestSensorData, 3000);
fetchLatestSensorData();
updateCameraIP();