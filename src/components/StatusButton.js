import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

const StatusButton = ({ status }) => {
  const [statusStyle, setStatusStyle] = useState(styles.notStarted);
  const [boxStyle, setBoxStyle] = useState(styles.box);

  const updateStatusStyle = () => {
    switch (status) {
      case 'not started':
        setStatusStyle(styles.notStarted);
        setBoxStyle(styles.boxNotStarted);
        break;
      case 'in progress':
        setStatusStyle(styles.inProgress);
        setBoxStyle(styles.boxInProgress);
        break;
      case 'done':
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
    marginTop: 8,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },

  boxNotStarted: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  boxInProgress: {
    backgroundColor: 'rgba(0, 0, 255, 0.1)',
  },
  boxDone: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  
  notStarted: {
    color: 'red',
  },
  inProgress: {
    color: 'blue',
  },
  done: {
    color: 'green',
  },
});

export default StatusButton;
