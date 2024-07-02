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

    const data = {
        username,
        phoneNumber,
        paymentMethod,
        key
    };

    const path = `data/user/${key}/datauser.json`;

    try {
        const response = await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'token YOUR_GITHUB_TOKEN',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Add new user data',
                content: btoa(JSON.stringify(data)),
                sha: ''
            })
        });

        if (response.ok) {
            alert('Data submitted successfully!');
        } else {
            const responseData = await response.json();
            if (responseData.message && responseData.message.includes('already exists')) {
                alert('Data already exists. Updating existing data.');
                // Fetch the SHA of the existing file
                const existingFileResponse = await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'token YOUR_GITHUB_TOKEN'
                    }
                });
                const existingFileData = await existingFileResponse.json();
                const sha = existingFileData.sha;

                // Update the existing file
                await fetch(`https://api.github.com/repos/danaovogopay/danaovogopay.github.io/contents/${path}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'token YOUR_GITHUB_TOKEN',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Update user data',
                        content: btoa(JSON.stringify(data)),
                        sha: sha
                    })
                });

                alert('Data updated successfully!');
            } else {
                alert('An error occurred. Please try again.');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
