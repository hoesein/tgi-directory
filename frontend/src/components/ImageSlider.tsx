import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text } from 'react-native-paper';

// Hero card in HomeScreen uses marginHorizontal 16 + padding 16 on each side.
const HORIZONTAL_INSET = 16 + 16;

interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
}

const SLIDER_DATA: SliderItem[] = [
  {
    id: '1',
    title: 'Famous Places',
    subtitle: 'Explore top attractions',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    color: '#FF6B35',
  },
  {
    id: '2',
    title: 'Best Restaurants',
    subtitle: 'Top dining experiences',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop',
    color: '#4ECDC4',
  },
  {
    id: '3',
    title: 'Popular Cafes',
    subtitle: 'Cozy coffee spots',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=200&fit=crop',
    color: '#FFD93D',
  },
];

const ImageSlider = () => {
  const { width: screenWidth } = useWindowDimensions();
  const slideWidth = screenWidth;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % SLIDER_DATA.length;
        scrollViewRef.current?.scrollTo({ x: next * slideWidth, animated: true });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [slideWidth]);

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    scrollViewRef.current?.scrollTo({ x: index * slideWidth, animated: true });
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    setActiveIndex(Math.min(Math.max(index, 0), SLIDER_DATA.length - 1));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {SLIDER_DATA.map((item) => (
          <TouchableOpacity key={item.id} activeOpacity={0.9}>
            <View style={[styles.slide, { width: slideWidth }]}>
              <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
              <View style={styles.textContainer}>
                <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
                <Text variant="bodySmall" style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dotContainer}>
        {SLIDER_DATA.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleDotPress(index)}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
            accessibilityRole="button"
            accessibilityLabel={`Go to slide ${index + 1}`}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  slide: {
    height: 200,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  textContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 24,
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#FF6B35',
    width: 16,
  },
});

export default ImageSlider;
