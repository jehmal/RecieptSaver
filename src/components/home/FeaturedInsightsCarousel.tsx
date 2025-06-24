import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 40; // 20px padding on each side

interface InsightData {
  id: string;
  type: 'top-merchant' | 'biggest-purchase' | 'category-leader' | 'savings-alert';
  title: string;
  subtitle: string;
  image: string;
  imageBackgroundColor?: string;
}

const FeaturedInsightsCarousel: React.FC = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  // Sample data for the four different insight types
  const insights: InsightData[] = [
    {
      id: '1',
      type: 'top-merchant',
      title: 'Whole Foods Market',
      subtitle: '12 receipts this month • $487.32 total spent',
      image: 'https://via.placeholder.com/80x80/4B9C3F/FFFFFF?text=WF',
      imageBackgroundColor: '#4B9C3F',
    },
    {
      id: '2',
      type: 'biggest-purchase',
      title: 'Largest Purchase',
      subtitle: 'Apple Store • $1,299.00 on Oct 15',
      image: 'https://via.placeholder.com/80x80/000000/FFFFFF?text=A',
      imageBackgroundColor: '#000000',
    },
    {
      id: '3',
      type: 'category-leader',
      title: 'Top Category: Groceries',
      subtitle: '34 receipts • $892.45 this month',
      image: 'https://via.placeholder.com/80x80/FF6B6B/FFFFFF?text=G',
      imageBackgroundColor: '#FF6B6B',
    },
    {
      id: '4',
      type: 'savings-alert',
      title: 'Spending Down 23%',
      subtitle: 'Saved $432 compared to last month',
      image: 'https://via.placeholder.com/80x80/4ECDC4/FFFFFF?text=$',
      imageBackgroundColor: '#4ECDC4',
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveIndex(index);
  };

  const renderInsightCard = (insight: InsightData) => (
    <View key={insight.id} style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {insight.title}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {insight.subtitle}
            </Text>
          </View>
          <View style={[styles.imageContainer, { backgroundColor: insight.imageBackgroundColor }]}>
            <Image source={{ uri: insight.image }} style={styles.merchantImage} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {insights.map((_, index) => {
        const inputRange = [
          (index - 1) * CARD_WIDTH,
          index * CARD_WIDTH,
          (index + 1) * CARD_WIDTH,
        ];

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [1, 1.2, 1],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              {
                opacity,
                transform: [{ scale }],
                backgroundColor: index === activeIndex ? '#1C1C1E' : '#D1D1D6',
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true, listener: handleScroll }
        )}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollViewContent}
      >
        {insights.map(renderInsightCard)}
      </Animated.ScrollView>
      {renderPaginationDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    paddingHorizontal: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 17,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  merchantImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default FeaturedInsightsCarousel;