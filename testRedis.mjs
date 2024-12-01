import { createClient } from 'redis';

async function testRedis() {
  const client = createClient();

  client.on('error', (err) => console.error('Redis Client Error:', err));
  client.on('ready', () => console.log('Redis Client is ready'));
  
  try {
    await client.connect();
    console.log('Redis Client Connected');
    
    const testKey = 'test_key';
    const testValue = 'test_value';

    // Set a test key
    await client.set(testKey, testValue, { EX: 10 });
    console.log(`Key "${testKey}" set successfully`);

    // Retrieve the test key
    const value = await client.get(testKey);
    console.log(`Value for key "${testKey}": ${value}`);

    // Disconnect
    await client.quit();
  } catch (error) {
    console.error('Error testing Redis:', error);
  }
}

testRedis();
