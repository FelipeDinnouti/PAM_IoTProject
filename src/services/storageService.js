import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TEMP: '@myiot_temp',
  HUM: '@myiot_hum',
  LIGHT: '@myiot_light',
  LAST_UPDATE: '@myiot_last_update',
};

export async function loadInitialState() {
  try {
    const [[, temp], [, hum], [, light], [, lastUpdate]] = await AsyncStorage.multiGet([
      KEYS.TEMP,
      KEYS.HUM,
      KEYS.LIGHT,
      KEYS.LAST_UPDATE,
    ]);
    return {
      temp: temp !== null ? parseFloat(temp) : 0,
      hum: hum !== null ? parseFloat(hum) : 0,
      isLightOn: light !== null ? light === 'true' : false,
      lastUpdated: lastUpdate !== null ? parseInt(lastUpdate, 10) : null,
    };
  } catch {
    return { temp: 0, hum: 0, isLightOn: false, lastUpdated: null };
  }
}

export async function saveState({ temp, hum, isLightOn }) {
  const now = String(Date.now());
  await AsyncStorage.multiSet([
    [KEYS.TEMP, String(temp)],
    [KEYS.HUM, String(hum)],
    [KEYS.LIGHT, String(isLightOn)],
    [KEYS.LAST_UPDATE, now],
  ]);
}
