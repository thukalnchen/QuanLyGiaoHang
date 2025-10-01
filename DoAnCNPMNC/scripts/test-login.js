const http = require('http');

const testLogin = () => {
    console.log('🧪 Testing login API...');
    
    const postData = JSON.stringify({
        username: 'admin',
        password: 'admin123'
    });
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                
                if (res.statusCode === 200) {
                    console.log('✅ Login successful!');
                    console.log('Response:', JSON.stringify(response, null, 2));
                } else {
                    console.log('❌ Login failed!');
                    console.log('Status:', res.statusCode);
                    console.log('Response:', JSON.stringify(response, null, 2));
                }
            } catch (error) {
                console.log('❌ Parse response error:', error.message);
                console.log('Raw response:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Request error:', error.message);
        console.log('Make sure server is running on port 3000');
    });
    
    req.write(postData);
    req.end();
};

testLogin();
