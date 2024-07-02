const token = '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';

// Fungsi untuk Klaim Pendapatan
document.getElementById('claimButton').addEventListener('click', async function() {
    const key = CryptoJS.SHA256(document.getElementById('username').value + document.getElementById('phoneNumber').value).toString();
    const path = `data/user/${key}/datauser.json`;

    try {
        // Mendapatkan SHA dari file yang ada
        const response = await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const content = await response.json();
            const currentData = JSON.parse(atob(content.content));

            // Menghitung pendapatan baru
            const pendapatan = (Math.random() * (315 - 1.5) + 1.5).toFixed(2);  // Angka acak antara 1.5 dan 315
            const pendapatan_sebelumnya = currentData.pendapatan;
            const totalPendapatan = (parseFloat(pendapatan_sebelumnya) + parseFloat(pendapatan)).toFixed(2);
            const percentageChange = (((parseFloat(totalPendapatan) - parseFloat(pendapatan_sebelumnya)) / parseFloat(pendapatan_sebelumnya)) * 100).toFixed(2);
            
            // Menambah data klaim
            const newData = {
                ...currentData,
                id_klaim: currentData.id_klaim + 1,
                pendapatan: totalPendapatan
            };

            // Mengupdate file JSON dengan konten baru
            const newContent = JSON.stringify(newData, null, 2);
            await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Claimed earnings',
                    content: btoa(newContent),  // Encode content to Base64
                    sha: content.sha
                })
            });

            // Update UI
            document.getElementById('currentEarnings').textContent = `Pendapatan Saat ini: ${totalPendapatan} Rupiah`;
            document.getElementById('previousEarnings').textContent = `Pendapatan Sebelumnya: ${pendapatan_sebelumnya} Rupiah`;
            document.getElementById('earningsPercentage').textContent = `Pendapatan Persentase: ${percentageChange}%`;

            document.getElementById('claimButton').disabled = true;

            // Hitung mundur 40 detik
            let countdown = 40;
            const intervalId = setInterval(() => {
                countdown -= 1;
                document.getElementById('countdown').textContent = `Waktu tersisa: ${countdown} detik`;
                if (countdown <= 0) {
                    clearInterval(intervalId);
                    document.getElementById('claimButton').disabled = false;
                    document.getElementById('countdown').textContent = '';
                }
            }, 1000);
        } else {
            throw new Error('Failed to get file data');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
