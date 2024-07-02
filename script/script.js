// Ganti dengan token API GitHub Anda
const token = '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';

// Mendapatkan SHA dari Versi File yang Ada
async function getFileSHA(path) {
    const response = await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const content = await response.json();
        return content.sha;
    } else {
        throw new Error('Failed to get file SHA');
    }
}

// Mengupdate File JSON dengan Konten Baru
async function updateFile(path, sha, newContent) {
    const response = await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Update user data',
            content: btoa(newContent),  // Encode content to Base64
            sha: sha
        })
    });

    if (response.ok) {
        console.log('File updated successfully');
    } else {
        throw new Error('Failed to update file');
    }
}

document.getElementById('paymentForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    // Validasi input
    const usernameRegex = /^[a-zA-Z]+$/;
    const phoneNumberRegex = /^\d+$/;

    if (!usernameRegex.test(username)) {
        alert('Username hanya boleh berisi huruf.');
        return;
    }

    if (!phoneNumberRegex.test(phoneNumber)) {
        alert('Nomor handphone hanya boleh berisi angka.');
        return;
    }

    const paymentMethod = document.getElementById('paymentMethod').value;
    const key = CryptoJS.SHA256(username + phoneNumber).toString();
    const path = `data/user/${key}/datauser.json`;

    let data = {
        username,
        phoneNumber,
        paymentMethod,
        key,
        id_klaim: 0,
        pendapatan: 0,
        pendapatan_sebelumnya: 0
    };

    try {
        // Cek apakah data sudah ada
        let response = await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const content = await response.json();
            const currentData = JSON.parse(atob(content.content));
            data = {
                ...currentData,
                pendapatan_sebelumnya: currentData.pendapatan
            };
        }

        // Simpan atau perbarui data
        const newContent = JSON.stringify(data, null, 2);
        const sha = response.ok ? (await getFileSHA(path)) : '';

        await updateFile(path, sha, newContent);

        if (response.ok) {
            alert('Data submitted successfully!');
        } else {
            alert('Data created successfully!');
        }

        document.getElementById('username').disabled = true;
        document.getElementById('phoneNumber').disabled = true;
        document.getElementById('paymentMethod').disabled = true;
        document.getElementById('paymentForm').querySelector('button').disabled = true;
        document.getElementById('faucetSection').style.display = 'block';
        document.getElementById('claimButton').disabled = false;
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
