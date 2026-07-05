// قائمة بمعرفات صناديق SenseBox
const SENSEBOX_IDS = [
  '5eba5fbad46fb8001b799786',
  '5c21ff8f919bf8001adf2488',
  '5ade1acf223bd80019a1011c'
];
//دالة لجلب درجة الحرارة من API الخاص بـ OpenSenseMap
async function getTemperature(boxId) {
  const response = await fetch(`https://api.opensensemap.org/boxes/${boxId}`);
  const data = await response.json();
  const tempSensor = data.sensors.find(s => s.title === 'Temperatur');
  return {
    value: parseFloat(tempSensor.lastMeasurement.value),
    createdAt: tempSensor.lastMeasurement.createdAt
  };
}
module.exports = {
  SENSEBOX_IDS,
  getTemperature
}; 