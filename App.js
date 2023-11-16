import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';

import WorkCard from './src/components/WorkCard';
import OngoingWorkCard from './src/components/OngoingWorkCard';

import fonts from './styles/fonts';
import images from './styles/images';

export default function App() {

  const cards = [
    { id: 1, color: '#BAE6FF', icon: require('./assets/ic_round-wifi.png'), text: 'Håndverk' },
    { id: 2, color: '#BAE6FF', icon: require('./assets/ic_round-wifi.png'), text: 'IT-hjelp' },
    { id: 3, color: '#BAE6FF', icon: require('./assets/ic_round-wifi.png'), text: 'Omsorg' },
    
    { id: 4, color: '#BAE6FF', icon: require('./assets/ic_round-wifi.png'), text: 'Lorem' },
    { id: 5, color: '#BAE6FF', icon: require('./assets/ic_round-wifi.png'), text: 'Ipsum' },
    { id: 6, color: '#BAE6FF', icon: require('./assets/ic_round-wifi.png'), text: 'Dolor' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView/>

        {/* Header */}
        <View style={{paddingHorizontal: 20, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

          <Text style={fonts.header}>Din side</Text>

          {/* Bell & user */}
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity>
              <Image 
                source={require('./assets/noti.png')}
                style={images.icon48}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image 
                source={require('./assets/user-1.png')}
                style={[images.icon48, {marginLeft: 8}]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hva trenger du hjelp med? */}
        <View style={{paddingHorizontal: 20, marginTop: 32}}>

          <Text style={fonts.subHeader}>Hva trenger du hjelp med?</Text>

          {/* cards */}
          <View style={styles.cardGrid}>
            {cards.map((card) => (
              <WorkCard
                key={card.id}
                color={card.color}
                icon={card.icon}
                text={card.text}
                onPress={() => console.log(`Klikket på ${card.text}`)}
              />
            ))}
          </View>

          {/* Se alle btn */}
          <TouchableOpacity 
            style={{ marginTop: 20, backgroundColor: '#218CC9', paddingVertical: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 2 }}
          >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '500' }}>Se alle kategorier</Text>
          </TouchableOpacity>

        </View>

        {/* Pågående arbeid */}
        <View style={{paddingHorizontal: 20, marginTop: 32}}>

          <Text style={fonts.subHeader}>Pågående arbeid</Text>

        </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    rowGap: 16,
  },
});
