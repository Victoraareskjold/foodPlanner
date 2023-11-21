import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

const StatusButton = ({ status }) => {
  const [statusStyle, setStatusStyle] = useState(styles.notStarted);
  const [boxStyle, setBoxStyle] = useState(styles.box);

  const updateStatusStyle = () => {
    switch (status) {
      case 'Ikke startet':
        setStatusStyle(styles.notStarted);
        setBoxStyle(styles.boxNotStarted);
        break;
      case 'Pågår':
        setStatusStyle(styles.inProgress);
        setBoxStyle(styles.boxInProgress);
        break;
      case 'Fullført':
        setStatusStyle(styles.done);
        setBoxStyle(styles.boxDone);
        break;
      default:
        setStatusStyle(styles.notStarted);
        setBoxStyle(styles.boxNotStarted);
    }
  };

  useEffect(() => {
    updateStatusStyle();
  }, [status]);

  return (
    <View style={[styles.box, boxStyle]}>
      <Text style={[styles.status, statusStyle]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    marginTop: 16,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },

  boxNotStarted: {
    backgroundColor: '#E3E2E0',
  },
  boxInProgress: {
    backgroundColor: '#BCD7ED',
  },
  boxDone: {
    backgroundColor: '#DBEDDB',
  },
  
  notStarted: {
    color: '#32302C',
  },
  inProgress: {
    color: '#1B3E5D',
  },
  done: {
    color: '#6C9B7D',
  },
});

export default StatusButton;
