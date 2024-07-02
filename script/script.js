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
                'Authorization': 'token YOUR_GITHUB_TOKEN'
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
        const newContent = btoa(JSON.stringify(data));

        response = await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'token YOUR_GITHUB_TOKEN',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Add or update user data',
                content: newContent,
                sha: response.ok ? content.sha : ''
            })
        });

        if (response.ok) {
            alert('Data submitted successfully!');
            document.getElementById('username').disabled = true;
            document.getElementById('phoneNumber').disabled = true;
            document.getElementById('paymentMethod').disabled = true;
            document.getElementById('paymentForm').querySelector('button').disabled = true;
            document.getElementById('faucetSection').style.display = 'block';
            document.getElementById('claimButton').disabled = false;
        } else {
            alert('An error occurred. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
