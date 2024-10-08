// App.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

const API_URL = 'https://apihub.staging.appply.link/chatgpt';

const App = () => {
  const [beerCount, setBeerCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [joke, setJoke] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedBeerCount = await AsyncStorage.getItem('beerCount');
      const storedStartTime = await AsyncStorage.getItem('startTime');
      if (storedBeerCount !== null) {
        setBeerCount(parseInt(storedBeerCount));
      }
      if (storedStartTime !== null) {
        setStartTime(new Date(storedStartTime));
      } else {
        const newStartTime = new Date();
        setStartTime(newStartTime);
        await AsyncStorage.setItem('startTime', newStartTime.toISOString());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (count) => {
    try {
      await AsyncStorage.setItem('beerCount', count.toString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addBeer = () => {
    const newCount = beerCount + 1;
    setBeerCount(newCount);
    saveData(newCount);
  };

  const resetCount = async () => {
    Alert.alert(
      "Reset Confirmation",
      "Are you sure you want to reset your beer count?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "OK", 
          onPress: async () => {
            setBeerCount(0);
            const newStartTime = new Date();
            setStartTime(newStartTime);
            await AsyncStorage.setItem('beerCount', '0');
            await AsyncStorage.setItem('startTime', newStartTime.toISOString());
            setJoke('');
          }
        }
      ]
    );
  };

  const getElapsedTime = () => {
    if (!startTime) return '';
    const now = new Date();
    const elapsed = now - startTime;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const generateJoke = async () => {
    try {
      const response = await axios.post(API_URL, {
        messages: [
          { role: "system", content: "You are a helpful assistant. Please provide a short, funny joke related to drinking or beer." },
          { role: "user", content: "Tell me a short, funny joke about drinking or beer." }
        ],
        model: "gpt-4o"
      });
      const { data } = response;
      setJoke(data.response);
    } catch (error) {
      console.error('Error generating joke:', error);
      setJoke('Failed to generate a joke. Have another beer!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beer Tracker</Text>
      <Text style={styles.count}>{beerCount}</Text>
      <Text style={styles.label}>Beers consumed</Text>
      <Text style={styles.time}>Time elapsed: {getElapsedTime()}</Text>
      <TouchableOpacity style={styles.beerButton} onPress={addBeer}>
        <FontAwesome name="beer" size={40} color="#1c1c1c" />
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetCount}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.jokeButton} onPress={generateJoke}>
          <Text style={styles.buttonText}>Get Joke</Text>
        </TouchableOpacity>
      </View>
      {joke ? (
        <View style={styles.jokeContainer}>
          <Text style={styles.jokeText}>{joke}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  count: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  label: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  time: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 30,
  },
  beerButton: {
    backgroundColor: '#ffd700',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#ff4500',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  jokeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1c1c',
  },
  jokeContainer: {
    backgroundColor: '#2c2c2c',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
  },
  jokeText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
// End of App.js