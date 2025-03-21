const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function addDummyPlayers() {
    try {
        // أولاً، إعادة تعيين البطولة
        console.log('Resetting tournament...');
        const resetResponse = await fetch('http://localhost:3001/api/reset', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!resetResponse.ok) {
            throw new Error('Failed to reset tournament');
        }

        console.log('Tournament reset successful');

        // إضافة 32 لاعب
        for (let i = 1; i <= 32; i++) {
            const player = {
                nickname: `Player ${i}`
            };

            const response = await fetch('http://localhost:3001/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(player)
            });

            if (!response.ok) {
                throw new Error(`Error adding player ${i}`);
            }

            console.log(`Added player ${i}`);
            
            // انتظار قليلاً بين كل إضافة
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log('All players added successfully!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

addDummyPlayers();
