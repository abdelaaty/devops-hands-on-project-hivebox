const request = require('supertest');
const express = require('express');
const app = express();
app.use('/', require('../src/routes/index'));
jest.mock('../src/services/openSenseMap');
// قائمة بمعرفات صناديق SenseBox
const { getTemperature } = require('../src/services/openSenseMap');
const { SENSEBOX_IDS } = require('../src/services/openSenseMap');
SENSEBOX_IDS.push('id1', 'id2', 'id3');
getTemperature.mockResolvedValue({
  value: 20,
  createdAt: new Date().toISOString()
});

test('GET /version returns the application version', async () => {
  const response = await request(app).get('/version');
  expect(response.status).toBe(200);
  expect(response.text).toMatch(/^\d+\.\d+\.\d+$/); // Matches semantic versioning format
});

test('GET /temperature returns average temperature', async () => {
  const response = await request(app).get('/temperature');
  console.log(JSON.stringify(response.body, null, 2)); // Log the response body for debugging
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('averageTemperature');
  expect(typeof response.body.averageTemperature).toBe('number');
  expect(response.body.averageTemperature).toBeGreaterThan(-50); // Assuming temperature won't be below -50°C
  expect(response.body.averageTemperature).toBeLessThan(50); // Assuming temperature won't be above 50°C
 console.log('Average temperature is within the expected range.');

}); 
test('GET /temperature returns 503 if any sensor data is outdated', async () => {
  // Mock getTemperature to return an outdated reading for one of the sensors
  getTemperature.mockImplementationOnce(async (boxId) => {
    if (boxId === SENSEBOX_IDS[0]) {
      return {
        value: 20,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      };
    }
    return {
      value: 20,
      createdAt: new Date().toISOString()
    };
  });

  const response = await request(app).get('/temperature');
  expect(response.status).toBe(503);
  expect(response.body).toHaveProperty('error', 'Sensor data is outdated');
}); 