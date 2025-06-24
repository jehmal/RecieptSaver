import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ReceiptInfoGridProps {
  amount: string;
  date: string;
  paymentMethod: string;
  time: string;
}

interface GridItemProps {
  label: string;
  value: string;
}

const GridItem: React.FC<GridItemProps> = ({ label, value }) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    gridItem: {
      flex: 1,
      height: 56,
    },
    label: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      fontWeight: '400',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    value: {
      fontSize: 17,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginTop: 4,
    },
  });

  return (
    <View style={styles.gridItem}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const ReceiptInfoGrid: React.FC<ReceiptInfoGridProps> = ({
  amount,
  date,
  paymentMethod,
  time,
}) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <GridItem label="AMOUNT" value={amount} />
        <GridItem label="DATE" value={date} />
      </View>
      <View style={styles.row}>
        <GridItem label="PAYMENT" value={paymentMethod} />
        <GridItem label="TIME" value={time} />
      </View>
    </View>
  );
};

export default ReceiptInfoGrid;