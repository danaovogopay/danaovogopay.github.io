let isClaiming = false;
let claimCount = 0;
let totalIncome = 0;
let previousIncome = 0;
const claimButton = document.getElementById('claimButton');
const incomeDisplay = document.getElementById('incomeDisplay');
const previousIncomeDisplay = document.getElementById('previousIncomeDisplay');
const percentageIncomeDisplay = document.getElementById('percentageIncomeDisplay');

claimButton.addEventListener('click', async function() {
    if (isClaiming) return;

    isClaiming = true;
    claimButton.disabled = true;
    claimButton.textContent = 'Menghitung Mundur...';

    let countdown = 40;
    const countdownInterval = setInterval(() => {
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            claimButton.textContent = 'Klaim';
            claimButton.disabled = false;
            isClaiming = false;
            updateIncome();
        } else {
            claimButton.textContent = `Menghitung Mundur... (${countdown})`;
            countdown--;
        }
    }, 1000);
});

async function updateIncome() {
    const username = document.getElementById('username').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const key = CryptoJS.SHA256(username + phoneNumber).toString();
    const path = `data/user/${key}/datauser.json`;

    try {
        const response = await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
            method: 'GET',
            headers: {
                'Authorization': 'token YOUR_GITHUB_TOKEN'
            }
        });
        const content = await response.json();
        const sha = content.sha;
        const currentData = JSON.parse(atob(content.content));

        const newIncome = Math.random() * (315 - 1.5) + 1.5;
        previousIncome = currentData.pendapatan;
        currentData.pendapatan += newIncome;
        currentData.id_klaim += 1;
        currentData.pendapatan_sebelumnya = previousIncome;

        const newContent = btoa(JSON.stringify(currentData));

        await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'token YOUR_GITHUB_TOKEN',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update user income',
                content: newContent,
                sha: sha
            })
        });

        totalIncome = currentData.pendapatan;
        claimCount = currentData.id_klaim;
        const percentageIncrease = ((totalIncome - previousIncome) / previousIncome) * 100;

        incomeDisplay.textContent = `Pendapatan Saat ini: ${totalIncome.toFixed(2)} Rupiah`;
        previousIncomeDisplay.textContent = `Pendapatan Sebelumnya: ${previousIncome.toFixed(2)} Rupiah`;
        percentageIncomeDisplay.textContent = `Pendapatan Persentase: ${percentageIncrease.toFixed(2)}%`;
    }
      
