// ---------- Управление пользователями ----------
function getUsers() {
    let users = localStorage.getItem('agro_users');
    if (!users) {
        // начальный тестовый пользователь
        let defaultUsers = [{ login: "demo", password: btoa("demo") }];
        localStorage.setItem('agro_users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(users);
}

function saveUsers(users) {
    localStorage.setItem('agro_users', JSON.stringify(users));
}

function registerUser(login, password) {
    let users = getUsers();
    if (users.find(u => u.login === login)) return false;
    users.push({ login: login, password: btoa(password) });
    saveUsers(users);
    return true;
}

function loginUser(login, password) {
    let users = getUsers();
    let user = users.find(u => u.login === login && u.password === btoa(password));
    if (user) {
        localStorage.setItem('agro_current_user', login);
        return true;
    }
    return false;
}

function logout() {
    localStorage.removeItem('agro_current_user');
    window.location.href = 'index.html';
}

function checkAuth() {
    let currentUser = localStorage.getItem('agro_current_user');
    if (!currentUser && window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
    }
    return currentUser;
}

// ---------- Привязка данных к пользователю ----------
function getUserHistoryKey() {
    let user = localStorage.getItem('agro_current_user');
    return `agro_tech_history_${user}`;
}

function getHistory() {
    let key = getUserHistoryKey();
    let hist = localStorage.getItem(key);
    return hist ? JSON.parse(hist) : [];
}

function saveHistory(history) {
    let key = getUserHistoryKey();
    localStorage.setItem(key, JSON.stringify(history));
}

// ---------- Данные для техкарты (справочники) ----------
const culturesDB = {
    wheat: { name: "Яровая пшеница", seedNorm_kg_ha: 220 },
    barley: { name: "Ячмень", seedNorm_kg_ha: 210 },
    corn: { name: "Кукуруза", seedNorm_kg_ha: 28 }
};

const operationsLibrary = {
    "moldboard_plowing": { name: "Вспашка зяби", fuelPerHa: 10.2, machine: "Т-150 + ПЛН-4-35", techMode: ["traditional"], phase: "предпосевная", defaultNpk: { N:0, P:0, K:0 } },
    "disking": { name: "Дискование", fuelPerHa: 5.8, machine: "МТЗ-82 + БДТ-3", techMode: ["traditional","minimal"], phase: "предпосевная", defaultNpk: { N:0, P:0, K:0 } },
    "cultivation": { name: "Культивация", fuelPerHa: 4.5, machine: "МТЗ-82 + КПС-4", techMode: ["traditional","minimal"], phase: "предпосевная", defaultNpk: { N:0, P:0, K:0 } },
    "sowing": { name: "Посев", fuelPerHa: 3.2, machine: "John Deere 8R + S700", techMode: ["traditional","minimal","notill"], phase: "посев", defaultNpk: { N:15, P:30, K:15 } },
    "direct_sowing": { name: "Прямой посев (No-Till)", fuelPerHa: 2.8, machine: "Horsch Avatar", techMode: ["notill"], phase: "посев", defaultNpk: { N:20, P:35, K:20 } },
    "nitrogen_fert": { name: "Азотная подкормка", fuelPerHa: 1.2, machine: "Разбрасыватель Amazon", techMode: ["traditional","minimal","notill"], phase: "вегетация", defaultNpk: { N:45, P:0, K:0 } },
    "herbicide": { name: "Обработка гербицидами", fuelPerHa: 0.9, machine: "Опрыскиватель", techMode: ["traditional","minimal","notill"], phase: "вегетация", defaultNpk: { N:0, P:0, K:0 } },
    "harvest": { name: "Уборка комбайном", fuelPerHa: 11.5, machine: "Комбайн Acros", techMode: ["traditional","minimal","notill"], phase: "уборка", defaultNpk: { N:0, P:0, K:0 } },
    "rolling": { name: "Прикатывание", fuelPerHa: 1.8, machine: "МТЗ+3КК-6", techMode: ["traditional","minimal"], phase: "посев", defaultNpk: { N:0, P:0, K:0 } }
};

const soilFactors = {
    chernozem: { N:0.9, P:0.95, K:0.9 },
    sodpodzol: { N:1.2, P:1.1, K:1.15 },
    chestnut: { N:1.05, P:1.0, K:1.0 }
};

function getOperationsByTech(techType) {
    if(techType === "traditional") return ["moldboard_plowing","disking","cultivation","sowing","rolling","nitrogen_fert","herbicide","harvest"];
    if(techType === "minimal") return ["disking","cultivation","sowing","rolling","nitrogen_fert","herbicide","harvest"];
    if(techType === "notill") return ["direct_sowing","nitrogen_fert","herbicide","harvest"];
    return [];
}

function generateTechCardData(cultureId, areaHa, soilType, predecessor, techType) {
    let opsKeys = getOperationsByTech(techType);
    let soilFactor = soilFactors[soilType] || { N:1, P:1, K:1 };
    let isLegume = predecessor === "legume";
    let legumeDiscount = isLegume ? 0.75 : 1.0;
    let rows = [], totalFuelAll = 0, totalN=0, totalP=0, totalK=0;
    let seedKg = culturesDB[cultureId].seedNorm_kg_ha;
    let seedCentnerPerHa = seedKg/100;
    let totalSeedCentner = seedCentnerPerHa * areaHa;
    let idx=1;
    for(let key of opsKeys){
        let op = operationsLibrary[key];
        if(!op) continue;
        let totalFuel = op.fuelPerHa * areaHa;
        totalFuelAll += totalFuel;
        let appliedN = (op.defaultNpk.N||0) * soilFactor.N * legumeDiscount;
        let appliedP = (op.defaultNpk.P||0) * soilFactor.P;
        let appliedK = (op.defaultNpk.K||0) * soilFactor.K;
        totalN += appliedN; totalP += appliedP; totalK += appliedK;
        let fertStr = (appliedN>0||appliedP>0||appliedK>0) ? `N ${appliedN.toFixed(1)} P₂O₅ ${appliedP.toFixed(1)} K₂O ${appliedK.toFixed(1)}` : "—";
        let dateStr = op.phase==="предпосевная" ? "апрель" : (op.phase==="посев" ? "май" : (op.phase==="вегетация" ? "июнь-июль" : "август"));
        let seedDisplay = (key==="sowing"||key==="direct_sowing") ? `${seedCentnerPerHa.toFixed(1)} ц/га` : "—";
        rows.push({
            num: idx++,
            operation: op.name,
            term: dateStr,
            machine: op.machine,
            fuelPerHa: op.fuelPerHa.toFixed(1),
            totalFuel: totalFuel.toFixed(0),
            fertilizer: fertStr,
            seed: seedDisplay
        });
    }
    let fertTotal = `N: ${totalN.toFixed(1)} кг/га, P₂O₅: ${totalP.toFixed(1)} кг/га, K₂O: ${totalK.toFixed(1)} кг/га`;
    return { rows, totalFuelAll, fertTotal, seedTotal: `Семян: ${totalSeedCentner.toFixed(1)} ц всего (${seedCentnerPerHa.toFixed(1)} ц/га)`, area:areaHa, cultureName: culturesDB[cultureId].name };
}

// Экспорт в CSV
function exportTechCardToCSV(rows, totalFuelAll, fertTotal, seedTotal, area) {
    let csvRows = [['№','Операция','Срок','Агрегат','ГСМ л/га','Всего ГСМ','Удобрения','Семена ц/га']];
    rows.forEach(r => {
        csvRows.push([r.num, r.operation, r.term, r.machine, r.fuelPerHa, r.totalFuel, r.fertilizer, r.seed]);
    });
    csvRows.push([],['Сводка:', seedTotal, `ГСМ всего: ${totalFuelAll.toFixed(0)} л`, fertTotal]);
    let csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(';')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'tech_card.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}