/**
 * Test script to verify API integrations
 * Run with: npx tsx test-api.ts
 */

import fs from 'fs/promises';

import { 
  fetchTLEFromCelesTrak, 
  fetchTLEByNoradId, 
  fetchLatestCMEPrediction, 
  fetchGeomagneticStorm,
  fetchSpaceWeatherAlerts,
  fetchConjunctionData,
  CELESTRAK_GROUPS 
} from './src/utils/api.js';

async function testAPIs() {
  console.log('🚀 Testing Unified Satellite Threat Monitor APIs\n');

  try {
    // Test CelesTrak TLE data
    console.log('📡 Testing CelesTrak TLE Data...');
    const stations = await fetchTLEFromCelesTrak('stations');
    console.log(`✅ Loaded ${stations.length} space stations`);
    console.log(`   First station: ${stations[0]?.name}`);
    
    // Test specific satellite (ISS)
    console.log('\n🛰️ Testing ISS TLE Data...');
    const iss = await fetchTLEByNoradId('25544');
    console.log(`✅ ISS loaded: ${iss.name}`);
    console.log(`   TLE Line 1: ${iss.line1.substring(0, 50)}...`);

    // Test CME prediction data
    console.log('\n☀️ Testing CME Prediction Data...');
    const predictions = await fetchLatestCMEPrediction();

    if (predictions) {
      console.log(`✅ Found CME Prediction:`);
      console.log(`   ID: ${predictions.id}`);
      console.log(`   Predicted Arrival Time: ${predictions.predictedArrivalTime}`);
      console.log(`   CME Time: ${predictions.cmeTime}`);
      console.log(`   Probability: ${predictions.probability}%`);
      console.log(`   Source Location: ${predictions.sourceLocation || 'N/A'}`);
      console.log(`   Instruments: ${predictions.instruments.map(i => i.displayName).join(', ')}`);

      // Write the prediction to a new file
      const fileName = 'latest-cme-prediction.json';
      await fs.writeFile(fileName, JSON.stringify(predictions, null, 2));
      console.log(`📁 CME Prediction written to ${fileName}`);
    } else {
      console.log('❌ No valid CME predictions found.');
    }

    // Test geomagnetic storm data
    console.log('\n🌪️ Testing NOAA Geomagnetic Data...');
    const geomagnetic = await fetchGeomagneticStorm();
    console.log(`✅ Loaded ${geomagnetic.length} geomagnetic readings`);
    if (geomagnetic.length > 0) {
      const latest = geomagnetic[geomagnetic.length - 1];
      console.log(`   Latest Kp index: ${latest.kp_index}`);
      console.log(`   Time: ${latest.time_tag}`);
    }

    // Test space weather alerts
    console.log('\n⚠️ Testing NOAA Space Weather Alerts...');
    const alerts = await fetchSpaceWeatherAlerts();
    console.log(`✅ Loaded ${alerts.length} space weather alerts`);

    // Test conjunction data (mock)
    console.log('\n🚨 Testing Conjunction Data...');
    const conjunctions = await fetchConjunctionData();
    console.log(`✅ Loaded ${conjunctions.length} conjunction events`);
    conjunctions.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.objectName} -> ${c.satelliteId} (${c.risk} risk)`);
    });

    // Test available satellite groups
    console.log('\n📋 Available Satellite Groups:');
    CELESTRAK_GROUPS.forEach((group, i) => {
      console.log(`   ${i + 1}. ${group}`);
    });

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Space Stations: ${stations.length}`);
    console.log(`   - CME Events: ${cmes.length}`);
    console.log(`   - Geomagnetic Readings: ${geomagnetic.length}`);
    console.log(`   - Space Weather Alerts: ${alerts.length}`);
    console.log(`   - Conjunction Events: ${conjunctions.length}`);
    console.log(`   - Available Groups: ${CELESTRAK_GROUPS.length}`);

  } catch (error) {
    console.error('❌ API test failed:', error);
    process.exit(1);
  }
}

// Run tests
testAPIs();
